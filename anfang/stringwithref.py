from anfang import enum
from anfang.models import Place

class StringWithAnnotations():
    def __init__(self):
        # Technically, b-prefix is the same as string in Python2.x,
        # but we're using it here for clarity as to how we treat it
        # (i.e. parts of it might be decoded as UTF-8, or parts of it
        # might be used to index into a list of restaruants, etc.
        self.bytes = b''
        self.annotations = []

    def addAnnotation(self, annotation, annotation_bytes):
        assert(annotation.length == len(annotation_bytes))
        annotation.start_pos = len(self.bytes)
        self.annotations.append(annotation)
        self.bytes = self.bytes + annotation_bytes

    def finalize(self):
        cur_ptr = 0
        final_str = ''
        for x in self.annotations:
            one_annotation_bytes = self.bytes[cur_ptr:x.length]
            cur_ptr += x.length
            final_str = final_str + x.format_bytes(one_annotation_bytes)
        return final_str

class Annotation():
    def __init__(self):
        self.start_pos = -1
        self.length = 0
        self.annotation_type = None

    def format_bytes(self, bytes):
        pass

class RawUTF8(Annotation):
    def format_bytes(self, bytes):
        return bytes.decode("utf-8")

class PlaceAnnotation(Annotation):
    def __init__(self, name):
        self.name = name
        self.lat = 0.0
        self.lng = 0.0
        self.place_id = ''

    def format_bytes(self, bytes):
        return self.name
