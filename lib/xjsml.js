function parse(template) {
    var tags = [];
    var tagopen = false;
    var currenttag = '';
    
    [...template].forEach(c => {
        if (c == '<' && !tagopen) {
            tagopen = true;
        }
        if (c == '>' ) {
            
        }
    })
}