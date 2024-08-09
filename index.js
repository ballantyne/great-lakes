const path = require('path');
const os = require('os');
const fs = require('fs');
const { createHmac } = require('node:crypto');
const Cache = require('cache-rules-everything-around-me');




module.exports = require(path.join(__dirname, 'http'));






function isJSON(input) {
  var json = false;
  try {
    JSON.parse(input);
    json = true;
  } catch(error) {
    
  }
  return json;
}
module.exports.isJSON = isJSON;











function readJSON(file) {
  var data   = fs.readFileSync(file);
  var string = data.toString();
  var json;

  try {
    json = JSON.parse(string);
  } catch(error) {
    console.log(file);
    console.log(string);
    console.log(error);
  }

  return json;
}
module.exports.readJSON = readJSON;











function requireJSON(file) {
  if (process.env.NODE_ENV == 'production') {
    return require(file)
  } else {
    return readJSON([file, 'json'].join('.'));
  }
}
module.exports.requireJSON = requireJSON;











function prepare(config) {
  if (config.name == undefined) {
    config.name = 'default';
  }

  if (process.env.NODE_ENV == 'test' && config.folder == undefined) {
    config.folder = path.join(__dirname, '..', 'test', 'data');
  } else if (config.folder == undefined) {
    config.folder = path.join(os.tmpdir(), 'cream', config.name);
  }

  var cache = new Cache({
    silo: config.name, 
    signature: config.signature,
    folder: config.folder 
  })

  var cacheOptions = {};

  if (config.ttl != undefined) {
    cacheOptions.ttl = config.ttl;
  }

  if (config.cache) {
    return new Promise((resolve) => {
      cache.fetch(cacheOptions).then(() => {
	resolve(cache);
      });
    })
  } else {
    return new Promise((resolve) => {
      cache.missed = true;
      resolve(cache);
    })
  }
}
module.exports.prepare = prepare;








function cp(obj={}) {
  return structuredClone(obj);
}
module.exports.cp = cp;








// spooky things happen without the cp.  
// need to investigate further later.  
// I think the merge is doing something weird. 

function construct(cfg={}) {
  return function(...options) {
    var compiledObject = {};

    compiledObject = options.reduce((obj, current, index) => {
      if (typeof current == 'string' && cfg[current] != undefined) {
	obj = merge(obj, cfg[current]);
      } else {
	obj = merge(obj, current);
      }
      return obj;
    }, compiledObject)

    return compiledObject;
  }
}
module.exports.construct = construct;








function sway(transitions) {
  return function modulator(state, line) {

    var any = transitions.filter((transition) => { 
      return transition.states == undefined;
    });

    var currentState = transitions.filter((transition) => { 
      return transition.states != undefined && transition.states.indexOf(state) > -1;
    });

    var relevant = any.concat(currentState);

    var array = relevant.filter((transition) => { 
      switch(transition.trigger.type) {
	// not sure if this is the best way to identify a row with no tag.
	case 'noTag':
	  var matrix = ['<', '>'].map((char) => { 
	    return line.indexOf(char) == -1; 
	  });

	  return matrix.indexOf(false) == -1;
	case 'endsWith':
	  return new RegExp(transition.trigger.value+"^").test(line);
	case 'contains':
	  return line.indexOf(transition.trigger.value) > -1;
	case 'startsWith':
	  return line.indexOf(transition.trigger.value) == 0;
	case 'exact':
	  return line == transition.trigger.value;
	default:
	  return false;
      }
    });

    if (array.length > 0) {
      return array;
    } else {
      return [];
    }

  }
}
module.exports.sway = sway;








function extract(regexs) {
  return function(line) {
    return regexs.filter((regex) => {
      return regex.test(line);
    }).reduce((obj, regex) => {
      var matched = line.match(regex);
      Object.assign(obj, matched.groups);
      return obj;
    }, {})
  }
}

module.exports.extract = extract;








function fingerprint(namespace, string) {
  if (typeof string != 'string') {
    var sorted  = alphabetize(string);
    string = JSON.stringify(sorted);
  }

  var buffer = Buffer.from(string); 
  var signature = buffer.toString('base64');

  return createHmac('sha256', namespace)
    .update(signature)
    .digest('hex');
}
module.exports.fingerprint = fingerprint;












function ignorant(rules) {
  return function ignorance(line) {

    var array = rules.map((rule) => { 
      switch(rule.type) {
	case 'contains':
	  return line.indexOf(rule.value) > -1;
	case 'startsWith':
	  return line.indexOf(rule.value) == 0;
	case 'exact':
	  return line == rule.value;
	default:
	  return false;
      }
    });

    return array.indexOf(true) == -1;
  }
}
module.exports.ignorant = ignorant;













function merge(obj1={}, obj2={}) {
  return Object.keys(obj2).reduce((obj, key) => {
    if (obj2.hasOwnProperty(key)) {
      if (obj2[key] instanceof Object && obj[key] instanceof Object) {
	obj[key] = merge(obj[key], obj2[key]);
      } else {
	obj[key] = obj2[key];
      } 
    }  
    return obj;
  }, cp(obj1))
}
module.exports.merge = merge;











function alphabetize(toSort) {
  return Object.keys(toSort).sort().reduce((obj, key) => {
    if (typeof toSort[key] == 'object' && toSort[key] instanceof Object) {
      obj[key] = alphabetize(toSort[key]);
    } else {
      obj[key] = toSort[key]
    }
    return obj;
  }, {})
}
module.exports.alphabetize = alphabetize;











function metastasize(data, config, meta) {
  var results;
  
  if (config.meta) {
    results = {};
    results.meta = meta;
    results.data = data
  } else {
    results = data;
  }

  return results;
} 
module.exports.metastasize = metastasize;










function deglyph(text) {
  return text.replace('&#39;', "'").replace('&ndash;', '-').replace('&amp;', '&').replace('&nbsp;', ' ')
}
module.exports.deglyph = deglyph;











function restack(html, options={}) {
  if (options.split == undefined) {
    options.split = false
  }


  var array = html.split('').reduce((array, char) => {
    if (char == '<') {
      array.push('\n')
    }

    array.push(char);
    
    if (char == '>') {
      array.push('\n')
    }
    
    return array;
  }, [])

  // filter out extras and trim;
  array = array.join('').split('\n').filter((line) => { 
    return line != ''; 
  }).map((line) => { 
    return line.trim(); 
  })
  
  if (options.split) {
    return array;
  } else {
    return array.join('\n');
  }
}

module.exports.restack = restack;










function logger(options={}) {
  
  if (options.ignore == undefined) {
    options.ignore = []
  }

  if (options.verbose && options.ignore.indexOf(options.state) == -1) {
    console.log('.......................................................')
    if (typeof options.line == 'string') {
      console.log(options.index, options.state, options.line);
    } else {
      console.log(...options.line)
    }

    if (options.modulations.length > 0) {
      console.log('.......................................................')
      console.log('modulations');
      console.log('.......................................................')
      console.log(options.modulations);
    }
  }

}
module.exports.logger = logger;









