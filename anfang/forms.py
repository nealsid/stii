from django.forms import ModelForm, HiddenInput
from models import UserProfile, UserPicture, StatusUpdate

class ProfilePicForm(ModelForm):
    class Meta:
        model = UserPicture
        fields = ['picture']

class StatusUpdateForm(ModelForm):
    class Meta:
        model = StatusUpdate
        fields = ['text']
        widgets = {
            'text':HiddenInput(attrs={'name':'status_update_hidden'})
        }
