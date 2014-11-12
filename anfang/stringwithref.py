from anfang import enum

class StringWithAnnotations():
    bytes = []
    annotations = []

    def addAnnotation(self, annotation, bytes):
        assert(annotation.length == len(bytes))
        annotation.start_pos = len(bytes)
        self.annotations.append(annotation)
        self.bytes.append(bytes)

AnnotationType = enum('RawUTF8', 'PlaceReference')

class Annotation():
    start_pos = -1
    length = 0
    annotation_type = None

class RawUTF8(Annotation):
