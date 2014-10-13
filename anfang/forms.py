from django.forms import ModelForm
from models import UserProfile, StatusUpdate

class ProfilePicForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']

class StatusUpdateForm(ModelForm):
    class Meta:
        model = StatusUpdate
        fields = ['text']
