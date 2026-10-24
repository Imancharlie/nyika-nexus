from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("farm", "0002_chat_advisor"),
    ]

    operations = [
        migrations.AddField(
            model_name="chatsession",
            name="title",
            field=models.CharField(blank=True, max_length=80),
        ),
    ]
