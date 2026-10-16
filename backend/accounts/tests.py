from unittest import mock

from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from integrations.models import IntegrationSetting
from market.models import Product

from .models import PhoneOTP, User
from .phone import normalize_tz_phone

SIGNUP = {
    "username": "juma_h", "firstName": "Juma", "lastName": "Hassan", "phone": "0712 345 678",
    "password": "Shamba#2026", "passwordConfirm": "Shamba#2026",
}


def enable_sms():
    s = IntegrationSetting.get("sms")
    s.config = {"sender_id": "AGRIMIKA"}
    s.set_secrets({"api_key": "key123456", "secret_key": "secret123456"})
    s.enabled = True
    s.save()


class PhoneTests(TestCase):
    def test_formats(self):
        for raw in ["0712345678", "712 345 678", "255712345678", "+255 712-345-678", "0612345678"]:
            self.assertTrue(normalize_tz_phone(raw).startswith("+255"))
        self.assertEqual(normalize_tz_phone("0712 345 678"), "+255712345678")

    def test_rejects_invalid(self):
        for raw in ["0812345678", "07123", "abc", "+254712345678"]:
            with self.assertRaises(ValidationError):
                normalize_tz_phone(raw)


class AuthFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_without_sms_returns_tokens(self):
        r = self.client.post("/api/auth/register/", SIGNUP, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertIn("access", r.data)
        self.assertEqual(r.data["user"]["phone"], "+255712345678")
        self.assertEqual(r.data["user"]["language"], "sw")
        en = self.client.post("/api/auth/register/", {
            **SIGNUP, "username": "asha_m", "phone": "0712 345 679", "language": "en",
        }, format="json")
        self.assertEqual(en.status_code, 201, en.content)
        self.assertEqual(en.data["user"]["language"], "en")

    def test_register_validation(self):
        bad = {**SIGNUP, "passwordConfirm": "nope", "phone": "0812"}
        r = self.client.post("/api/auth/register/", bad, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("phone", r.data)

    def test_login_with_username_or_phone(self):
        self.client.post("/api/auth/register/", SIGNUP, format="json")
        for identifier in ["JUMA_H", "0712345678", "+255712345678"]:
            r = self.client.post("/api/auth/login/", {"identifier": identifier, "password": SIGNUP["password"]},
                                 format="json")
            self.assertEqual(r.status_code, 200, identifier)
        r = self.client.post("/api/auth/login/", {"identifier": "juma_h", "password": "wrong"}, format="json")
        self.assertEqual(r.status_code, 400)

    @mock.patch("integrations.sms._beem_send", return_value=(True, '{"successful":true}'))
    def test_otp_signup_flow(self, beem):
        enable_sms()
        r = self.client.post("/api/auth/register/", SIGNUP, format="json")
        self.assertTrue(r.data["requiresVerification"])
        self.assertNotIn("access", r.data)
        sent_text = beem.call_args[0][2]
        code = sent_text.split("ni ")[1][:6]

        login = self.client.post("/api/auth/login/", {"identifier": "juma_h", "password": SIGNUP["password"]},
                                 format="json")
        self.assertEqual(login.status_code, 403)
        self.assertEqual(login.data["code"], "phone_unverified")

        wrong = self.client.post("/api/auth/verify/confirm/", {"phone": "0712345678", "code": "000000"},
                                 format="json")
        self.assertEqual(wrong.status_code, 400)
        ok = self.client.post("/api/auth/verify/confirm/", {"phone": "0712345678", "code": code}, format="json")
        self.assertEqual(ok.status_code, 200, ok.content)
        self.assertTrue(ok.data["user"]["phoneVerified"])

    @mock.patch("integrations.sms._beem_send", return_value=(True, "{}"))
    def test_password_reset(self, beem):
        User.objects.create_user("amina", phone="0754000111", password="OldPass#2026")
        self.assertEqual(self.client.post("/api/auth/password-reset/request/", {"phone": "0754000111"},
                                          format="json").status_code, 503)
        enable_sms()
        self.client.post("/api/auth/password-reset/request/", {"phone": "0754000111"}, format="json")
        code = beem.call_args[0][2].split("ni ")[1][:6]
        r = self.client.post("/api/auth/password-reset/confirm/", {
            "phone": "+255754000111", "code": code, "password": "NewPass#2026", "passwordConfirm": "NewPass#2026",
        }, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertTrue(User.objects.get(username="amina").check_password("NewPass#2026"))

    def test_otp_attempt_limit(self):
        user = User.objects.create_user("x", phone="0700000001", password="p")
        code = PhoneOTP.issue(user, "verify")
        for _ in range(5):
            PhoneOTP.verify_code(user, "verify", "999999" if code != "999999" else "000000")
        self.assertFalse(PhoneOTP.verify_code(user, "verify", code))


class IntegrationAndAdminTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("boss", phone="0700000009", password="Admin#2026")
        self.farmer = User.objects.create_user("farmer", phone="0700000010", password="Farm#2026")
        self.client = APIClient()

    def test_secrets_are_encrypted_and_masked(self):
        self.client.force_authenticate(self.admin)
        r = self.client.put("/api/admin/integrations/sms/", {
            "config": {"sender_id": "AGRIMIKA"}, "secrets": {"api_key": "abcdef123456", "secret_key": "zzz999zzz"},
            "enabled": True}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertTrue(r.data["ready"])
        self.assertNotIn("abcdef123456", str(r.data))
        raw = IntegrationSetting.objects.get(kind="sms").secrets_encrypted
        self.assertNotIn("abcdef123456", raw)
        self.assertEqual(IntegrationSetting.get("sms").value("api_key"), "abcdef123456")
        r = self.client.put("/api/admin/integrations/sms/", {"secrets": {"api_key": ""}}, format="json")
        self.assertEqual(IntegrationSetting.get("sms").value("api_key"), "abcdef123456")

    def test_admin_requires_staff(self):
        self.client.force_authenticate(self.farmer)
        self.assertEqual(self.client.get("/api/admin/metrics/").status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get("/api/admin/metrics/").status_code, 200)

    def test_order_and_manual_payment(self):
        product = Product.objects.create(name="DAP", category="mbolea", price=85000, unit="50kg", stock=3)
        self.client.force_authenticate(self.farmer)
        r = self.client.post("/api/orders/", {"items": [{"productId": product.id, "quantity": 2}],
                                              "deliveryLocation": "Morogoro"}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.data["total"], 170000)
        too_many = self.client.post("/api/orders/", {"items": [{"productId": product.id, "quantity": 5}],
                                                     "deliveryLocation": "Morogoro"}, format="json")
        self.assertEqual(too_many.status_code, 400)
        pay = self.client.post(f"/api/orders/{r.data['id']}/pay/", {}, format="json")
        self.assertEqual(pay.data["gateway"], "manual")

        self.client.force_authenticate(self.admin)
        self.client.post(f"/api/admin/payments/{pay.data['payment']['id']}/mark-paid/")
        self.client.force_authenticate(self.farmer)
        order = self.client.get(f"/api/orders/{r.data['id']}/").data
        self.assertEqual(order["paymentStatus"], "imelipwa")
