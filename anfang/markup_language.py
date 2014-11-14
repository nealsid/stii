from HTMLParser import HTMLParser

TAGS = ['restaurant', 'museum', 'concert', 'comedy']

def tagForTagName(tagname):
    if tagname == "restaurant":
        return RestaurantTag()
    return None

class STIITag(object):
    def __init__(self):
        self.relevant_attributes = []

    def extract_relevant_attributes(self, attrs_dict):
        attr_values = {}
        for (name, val) in attrs_dict:
            if self.relevant_attributes.count(name) != 0:
                attr_values[name] = val
        return attr_values

class RestaurantTag(STIITag):
    def __init__(self):
        super(RestaurantTag, self).__init__()
        self.relevant_attributes = ['place_id','lat','lng']

class STIIHTMLParser(HTMLParser):
    def __init__(self, callback_object):
        self.open_tag_stack = []
        self.parser_callback = callback_object
        self.current_tag_attrs = {}
        HTMLParser.__init__(self)

    def handle_starttag(self, tag, attrs):
        self.open_tag_stack.append(tag)
        tag = tagForTagName(tag)
        print str(tag.extract_relevant_attributes(attrs))

    def handle_endtag(self, tag):
        if tag != self.open_tag_stack[-1]:
            print 'error: open tag not matched'
        else:
            close_tag = self.open_tag_stack.pop()
            print "closed tag: " + close_tag

    def handle_data(self, data):
        print "Encountered some data:", data
