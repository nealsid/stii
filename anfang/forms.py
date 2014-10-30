from django.forms import ModelForm
from models import UserProfile, UserPicture, StatusUpdate, UploadedPicture

class ProfilePicForm(ModelForm):
    class Meta:
        model = UserPicture
        fields = ['picture']

class UploadedPictureForm(ModelForm):
    class Meta:
        model = UploadedPicture
        fields = ['picture']

class StatusUpdateForm(ModelForm):
    class Meta:
        model = StatusUpdate
        fields = ['text']
