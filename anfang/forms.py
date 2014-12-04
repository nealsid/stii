from django.forms import ModelForm, TextInput
from models import UserProfile, UserPicture, StatusUpdate, UploadedPicture

class ProfilePicForm(ModelForm):
    class Meta:
        model = UserPicture
        fields = ['picture']

class StatusUpdateForm(ModelForm):
    class Meta:
        model = StatusUpdate
        fields = ['text']
        widgets = {
            'text':TextInput(attrs={'placeholder':'Write something ridiculous...'})
        }
