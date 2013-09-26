(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.Contrib.CollectionView', function() {
    var CollectionView;
    CollectionView = Giraffe.Contrib.CollectionView;
    it('should be OK', function() {
      return assert.ok(new CollectionView);
    });
    it('should render model views for a collection passed to the constructor', function() {
      var a, child1, child2, collection, _ref;
      collection = new Giraffe.Collection([{}, {}]);
      a = new CollectionView({
        collection: collection
      });
      a.attachTo(ut.getEl());
      assert.lengthOf(a.children, 2);
      _ref = a.children, child1 = _ref[0], child2 = _ref[1];
      ut.assert.attached(child1, a.$el);
      ut.assert.attached(child2, a.$el);
      ut.assert.rendered(child1);
      ut.assert.rendered(child2);
      return ut.assert.siblings(child1, child2);
    });
    it('should render model views for a plain array passed to the constructor', function() {
      var a, child1, child2, collection, _ref;
      collection = [{}, {}];
      a = new CollectionView({
        collection: collection
      });
      a.attachTo(ut.getEl());
      assert.lengthOf(a.children, 2);
      _ref = a.children, child1 = _ref[0], child2 = _ref[1];
      ut.assert.attached(child1, a.$el);
      ut.assert.attached(child2, a.$el);
      ut.assert.rendered(child1);
      ut.assert.rendered(child2);
      return ut.assert.siblings(child1, child2);
    });
    it('should render model views added after initialization', function() {
      var a, child, collection;
      collection = new Giraffe.Collection;
      a = new CollectionView({
        collection: collection
      });
      a.attachTo(ut.getEl());
      assert.lengthOf(a.children, 0);
      a.addOne({});
      assert.lengthOf(a.children, 1);
      child = a.children[0];
      ut.assert.attached(child, a.$el);
      return ut.assert.rendered(child);
    });
    it('should render models views when extended', function() {
      var A, a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      A = CollectionView.extend({
        collection: collection
      });
      a = new A;
      a.attachTo(ut.getEl());
      assert.lengthOf(a.children, 2);
      ut.assert.attached(a.children[0], a.$el);
      return ut.assert.attached(a.children[1], a.$el);
    });
    it('should sync when the collection is reset', function() {
      var a, collection, modelView;
      collection = new Giraffe.Collection([{}]);
      a = new CollectionView({
        collection: collection
      });
      a.attachTo(ut.getEl());
      assert.lengthOf(a.children, 1);
      modelView = a.children[0];
      ut.assert.attached(modelView, a.$el);
      collection.reset([{}, {}]);
      ut.assert.disposed(modelView);
      return assert.lengthOf(a.children, 2);
    });
    it('should sync when models are added to the collection', function() {
      var a;
      a = new CollectionView;
      a.attachTo(ut.getEl());
      a.collection.add({});
      assert.lengthOf(a.children, 1);
      a.collection.add({});
      assert.lengthOf(a.children, 2);
      return ut.assert.attached(a.children);
    });
    it('should sync when models are added via `addOne`', function() {
      var a;
      a = new CollectionView;
      a.attachTo(ut.getEl());
      a.addOne({});
      assert.lengthOf(a.children, 1);
      a.addOne({});
      assert.lengthOf(a.children, 2);
      return ut.assert.attached(a.children);
    });
    it('should sync when models are removed from the collection', function() {
      var a, modelView1, modelView2, _ref;
      a = new CollectionView;
      a.attachTo(ut.getEl());
      a.collection.add([{}, {}]);
      assert.lengthOf(a.children, 2);
      _ref = a.children, modelView1 = _ref[0], modelView2 = _ref[1];
      assert.ok(modelView1 && modelView2);
      assert.ok(modelView1.isAttached());
      assert.ok(modelView2.isAttached());
      a.collection.remove(a.collection.at(0));
      assert.lengthOf(a.children, 1);
      ut.assert.disposed(modelView1);
      ut.assert.notDisposed(modelView2);
      a.collection.remove(a.collection.at(0));
      assert.lengthOf(a.children, 0);
      return ut.assert.disposed(modelView2);
    });
    it('should sync when models are removed via `removeOne`', function() {
      var a, modelView1, modelView2, _ref;
      a = new CollectionView;
      a.attachTo(ut.getEl());
      a.collection.add([{}, {}]);
      assert.lengthOf(a.children, 2);
      _ref = a.children, modelView1 = _ref[0], modelView2 = _ref[1];
      assert.ok(modelView1 && modelView2);
      assert.ok(modelView1.isAttached());
      assert.ok(modelView2.isAttached());
      a.removeOne(a.collection.at(0));
      assert.lengthOf(a.children, 1);
      ut.assert.disposed(modelView1);
      ut.assert.notDisposed(modelView2);
      a.removeOne(a.collection.at(0));
      assert.lengthOf(a.children, 0);
      return ut.assert.disposed(modelView2);
    });
    it('should keep model views sorted when a value changes', function() {
      var a, child1, child2, collection, _ref, _ref1;
      collection = new Giraffe.Collection([
        {
          foo: 1
        }, {
          foo: 0
        }
      ], {
        comparator: 'foo'
      });
      a = new CollectionView({
        collection: collection
      });
      a.attachTo(ut.getEl());
      _ref = a.children, child1 = _ref[0], child2 = _ref[1];
      assert.equal(0, child1.model.get('foo'));
      assert.equal(1, child2.model.get('foo'));
      ut.assert.siblings(child1, child2);
      a.children[0].model.set('foo', 2);
      collection.sort();
      _ref1 = a.children, child1 = _ref1[0], child2 = _ref1[1];
      assert.equal(1, child1.model.get('foo'));
      assert.equal(2, child2.model.get('foo'));
      ut.assert.siblings(child1, child2);
      return ut.assert.attached(a.children);
    });
    it('should keep model views sorted when a new model is added', function() {
      var a, child1, child2, child3, collection, _ref;
      collection = new Giraffe.Collection([
        {
          foo: 0
        }, {
          foo: 2
        }
      ], {
        comparator: 'foo'
      });
      a = new CollectionView({
        collection: collection
      });
      a.addOne({
        foo: 1
      });
      _ref = a.children, child1 = _ref[0], child2 = _ref[1], child3 = _ref[2];
      ut.assert.siblings(child1, child2);
      ut.assert.siblings(child2, child3);
      return ut.assert.attached(a.children);
    });
    it('should use the `modelView` option to construct the views', function() {
      var MyModelView, a, child;
      MyModelView = Giraffe.View.extend({
        foo: 'bar'
      });
      a = new CollectionView({
        modelView: MyModelView
      });
      a.addOne({});
      child = a.children[0];
      assert.ok(child instanceof MyModelView);
      return assert.equal('bar', child.foo);
    });
    it('should pass `modelViewArgs` to the model views', function() {
      var a, child;
      a = new CollectionView({
        modelViewArgs: [
          {
            foo: 'bar'
          }
        ]
      });
      a.addOne({});
      child = a.children[0];
      return assert.equal('bar', child.foo);
    });
    it('should insert the model views in `modelViewEl` if provided', function() {
      var a, child1, child2, className;
      className = 'my-model-view-el';
      a = new CollectionView({
        modelViewEl: '.' + className,
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        }
      });
      a.addOne({});
      child1 = a.children[0];
      ut.assert.attached(child1, a.$('.' + className));
      a.addOne({});
      child2 = a.children[1];
      ut.assert.attached(child2, a.$('.' + className));
      return ut.assert.siblings(child1, child2);
    });
    it('should accept View#ui names for `modelViewEl`', function() {
      var a, child, className;
      className = 'my-model-view-el';
      a = new CollectionView({
        ui: {
          $myModelViewEl: '.' + className
        },
        modelViewEl: '$myModelViewEl',
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        }
      });
      a.addOne({});
      child = a.children[0];
      return ut.assert.attached(child, a.$myModelViewEl);
    });
    it('should accept `appEvents` as an option', function() {
      return ut.assert.appEventsOption(CollectionView);
    });
    it('should not re-render when a model changes by default', function() {
      var a, model;
      model = new Giraffe.Model({
        foo: 'bar'
      });
      a = new CollectionView({
        collection: [model],
        modelViewArgs: [
          {
            templateStrategy: function() {
              return "<div class='test'>" + (this.model.get("foo")) + "</div>";
            }
          }
        ]
      });
      a.render();
      ut.assert.hasText(a, 'bar');
      model.set('foo', 'baz');
      return ut.assert.hasText(a, 'bar');
    });
    return it('should re-render when a model changes if `renderOnChange` is true', function() {
      var a, model;
      model = new Giraffe.Model({
        foo: 'bar'
      });
      a = new CollectionView({
        collection: [model],
        modelViewArgs: [
          {
            templateStrategy: function() {
              return "<div class='test'>" + (this.model.get("foo")) + "</div>";
            }
          }
        ],
        renderOnChange: true
      });
      a.render();
      ut.assert.hasText(a, 'bar');
      model.set('foo', 'baz');
      return ut.assert.hasText(a, 'baz');
    });
  });

}).call(this);


/*
//@ sourceMappingURL=collectionViewTest.map
*/