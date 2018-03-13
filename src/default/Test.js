var calculatorMixin = Base => class extends Base {
  calc() { console.log('what');}
};

var randomizerMixin = Base => class extends Base {
  randomize() { console.log('object');}
};


class Foo { }
class Bar extends calculatorMixin(randomizerMixin(Foo)) { }


const bar = new Bar();

console.trace(bar);


const Empty = class {
  hi(){console.log('object');}
};

let em = new Empty();
em.hi();

