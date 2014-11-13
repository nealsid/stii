from anfang import enum
from anfang.models import Place

class StringWithAnnotations():
    bytes = []
    annotations = []

    def addAnnotation(self, annotation, bytes):
        assert(annotation.length == len(bytes))
        annotation.start_pos = len(self.bytes)
        self.annotations.append(annotation)
        self.bytes.append(bytes)

    def finalize(self):
        cur_ptr = 0
        final_str = ''
        for x in self.annotations:
            one_annotation_bytes = self.bytes[cur_ptr:x.length]
            cur_ptr += x.length
            final_str = final_str + x.format_bytes(one_annotation_bytes)
        return final_str

AnnotationType = enum('RawUTF8', 'PlaceReference')

class Annotation():
    start_pos = -1
    length = 0
    annotation_type = None

    def format_bytes(self, bytes):
        pass

class RawUTF8(Annotation):
    def format_bytes(self, bytes):
        return str(bytes)

class Place(Annotation):
    name = ''
    lat = 0.0
    lng = 0.0
    place_id = ''
    def format_bytes(self, bytes):
        return self.name
