# templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter
def ends_with(value, arg):
    """Check if the string ends with the given argument"""
    return value.endswith(arg)
