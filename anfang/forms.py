from django.forms import ModelForm
from models import UserProfile

class ProfilePicForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']
