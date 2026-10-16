from django import forms
from .models import Farmer
class FarmerRegistrationForm(forms.ModelForm):  # Use ModelForm instead of Form
    class Meta:
        model = Farmer  # Your Farmer model
        exclude = ['user','district']
        fields = ['name', 'email', 'phone_number', 'region', 'street', 'farm_size', 'crop_type', 'address']


    REGIONS = [
        ('', 'select. . . .'),
        ('Arusha', 'Arusha'),
        ('Dar es Salaam', 'Dar es Salaam'),
        ('Dodoma', 'Dodoma'),
        ('Geita', 'Geita'),
        ('Iringa', 'Iringa'),
        ('Kagera', 'Kagera'),
        ('Kigoma', 'Kigoma'),
        ('Kilimanjaro', 'Kilimanjaro'),
        ('Lindi', 'Lindi'),
        ('Mara', 'Mara'),
        ('Mbeya', 'Mbeya'),
        ('Morogoro', 'Morogoro'),
        ('Mtwara', 'Mtwara'),
        ('Mwanza', 'Mwanza'),
        ('Njombe', 'Njombe'),
        ('Pwani', 'Pwani'),
        ('Rukwa', 'Rukwa'),
        ('Ruvuma', 'Ruvuma'),
        ('Shinyanga', 'Shinyanga'),
        ('Singida', 'Singida'),
        ('Simiyu', 'Simiyu'),
        ('Tabora', 'Tabora'),
        ('Tanga', 'Tanga'),
    ]

    DISTRICTS= [
        ('Ilala','Ilala'),
    ]

    name = forms.CharField(label='Name', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    email = forms.EmailField(label='Email', widget=forms.EmailInput(attrs={'class': 'form-control'}))
    phone_number = forms.CharField(label='Phone Number', max_length=15, widget=forms.TextInput(attrs={'class': 'form-control'}))
    region = forms.ChoiceField(label='Region', choices=REGIONS, widget=forms.Select(attrs={'class': 'form-control'}))
    district = forms.ChoiceField(label='District', choices=DISTRICTS, widget=forms.Select(attrs={'class': 'form-control'}))
    street = forms.CharField(label='Farm Name', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    farm_size = forms.FloatField(label='Farm Size (Hectares)', widget=forms.NumberInput(attrs={'class': 'form-control'}))
    crop_type = forms.CharField(label='Crop Type', max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    address = forms.CharField(label='Address', widget=forms.Textarea(attrs={'class': 'form-control'}))

from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'caption', 'media']  # Include the fields you want to display in the form

        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Title/ Kichwa cha habari',
                'data-en': 'Title',
                'data-sw': 'Kichwa cha habari'
            }),
            'caption': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Caption/ Maelezo mafupi',
                'rows': 6
            }),
            'media': forms.ClearableFileInput(attrs={
                'class': 'form-control',
                'data-en': 'Upload media',
                'data-sw': 'Pakia picha au video'
            }),
        }

from django import forms
from .models import Report

class ReportForm(forms.ModelForm):
    class Meta:
        model = Report
        fields = ['title', 'description', 'report_type', 'farmer', 'file', 'pages']