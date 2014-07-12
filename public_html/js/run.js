var SchemaGenerator = function(input, output) {
  this.initialize(input, output);
};
SchemaGenerator.prototype = {
  input: null,
  output: null,
  initialize: function(input, output) {
    this.input = $(input);
    this.output = $(output);
  },
  is_array: function(value) {
    return value &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            typeof value.splice === 'function' &&
            !(value.propertyIsEnumerable('length'));
  },
  getType: function(obj) {
    var type = "STRING";
    if (this.is_array(obj)) {
      for (var i in obj) {
        var v = obj[i];
        return this.getType(v);
      }
    } else {
      switch (typeof obj) {
        case 'number':
          if (obj % 1 > 0) {
            type = 'FLOAT';
          } else {
            type = 'INTEGER';
          }
          break;
        case 'string':
        case 'boolean':
          type = (typeof obj).toUpperCase();
          break;
        case 'object':
          type = 'RECORD';
          break;
      }
    }
    return type;
  },
  generate: function(name, obj) {
    var s = {};
    if (name === null) {
      s = [];
      for (var key in obj) {
        console.log(key + " => " + (typeof obj[key]));
        s.push(this.generate(key, obj[key]));
      }
      return s;
    }
    s['name'] = name;
    s['type'] = this.getType(obj);
    if (this.is_array(obj)) {
      s['mode'] = 'repeated';
    }
    if (s['type'] === 'RECORD') {
      s['fields'] = [];
      for (var key in obj) {
        if (!this.is_array(obj[key])) {
          s['fields'].push(this.generate(key, obj[key]));
        } else {
          var t = this.generate(key, obj[key]);
          for (var findex in t['fields']) {
            s['fields'].push(t['fields'][findex]['fields']);
          }

        }
      }
    }
    return s;
  },
  render: function(schema) {
    $(this.output).text(JSON.stringify(schema, null, '\t'));
  }
};
$(document).ready(function() {
  $('#generate').click(function() {
    var sg = new SchemaGenerator('#source', '#schema');
    var source = $('#source').val();
    var json = JSON.parse(source);
    var schema = sg.generate(null, json);
    sg.render(schema);
  });
//  $('#generate').click();
});