(function() {
  var assert;

  assert = chai.assert;

  describe('Giraffe.Contrib.FastCollectionView', function() {
    var FastCollectionView, fcvDefaults;
    FastCollectionView = Giraffe.Contrib.FastCollectionView;
    fcvDefaults = {
      modelTemplate: '<li></li>',
      modelTemplateStrategy: 'underscore-template'
    };
    it('should be OK', function() {
      return assert.ok(new FastCollectionView(fcvDefaults));
    });
    it('should render els for a collection passed to the constructor', function() {
      var a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      assert.lengthOf(a.$el.children(), 0);
      a.render();
      assert.lengthOf(a.children, 0);
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should render els for a plain array passed to the constructor', function() {
      var a, collection;
      collection = [{}, {}];
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      assert.lengthOf(a.$el.children(), 0);
      a.render();
      assert.lengthOf(a.children, 0);
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should render models views when extended', function() {
      var A, a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      A = FastCollectionView.extend(_.defaults({
        collection: collection
      }, fcvDefaults));
      a = new A;
      a.attachTo(ut.getEl());
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should sync when the collection is reset', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(ut.getEl());
      a.addOne({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.reset([{}, {}]);
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should sync when models are added to the collection', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(ut.getEl());
      assert.lengthOf(a.$el.children(), 0);
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.add([{}, {}]);
      return assert.lengthOf(a.$el.children(), 3);
    });
    it('should sync when models are added via `addOne`', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(ut.getEl());
      a.addOne({});
      assert.lengthOf(a.$el.children(), 1);
      a.addOne({});
      assert.lengthOf(a.$el.children(), 2);
      a.addOne({});
      return assert.lengthOf(a.$el.children(), 3);
    });
    it('should sync when models are removed from the collection', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(ut.getEl());
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 2);
      a.collection.remove(a.collection.at(1));
      assert.lengthOf(a.$el.children(), 1);
      a.collection.remove(a.collection.at(0));
      return assert.lengthOf(a.$el.children(), 0);
    });
    it('should sync when models are removed via `removeOne`', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(ut.getEl());
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 2);
      a.removeOne(a.collection.at(1));
      assert.lengthOf(a.$el.children(), 1);
      a.removeOne(a.collection.at(0));
      return assert.lengthOf(a.$el.children(), 0);
    });
    it('should keep model views sorted when a value changes', function() {
      var a, collection, el1, el2, model1, model2, _ref, _ref1;
      collection = new Giraffe.Collection([
        {
          foo: 1
        }, {
          foo: 0
        }
      ], {
        comparator: 'foo'
      });
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      a.attachTo(ut.getEl());
      _ref = a.collection.models, model1 = _ref[0], model2 = _ref[1];
      assert.equal(0, model1.get('foo'));
      assert.equal(1, model2.get('foo'));
      el1 = a.getElByModel(model1);
      el2 = a.getElByModel(model2);
      ut.assertSiblings(el1, el2);
      model1.set('foo', 2);
      collection.sort();
      _ref1 = a.collection.models, model1 = _ref1[0], model2 = _ref1[1];
      assert.equal(1, model1.get('foo'));
      assert.equal(2, model2.get('foo'));
      el1 = a.getElByModel(model1);
      el2 = a.getElByModel(model2);
      return ut.assertSiblings(el1, el2);
    });
    it('should keep model views sorted when a new model is added', function() {
      var a, collection, el1, el2, el3, model1, model2, model3, _ref;
      collection = new Giraffe.Collection([
        {
          foo: 0
        }, {
          foo: 2
        }
      ], {
        comparator: 'foo'
      });
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      a.addOne({
        foo: 1
      });
      _ref = collection.models, model1 = _ref[0], model2 = _ref[1], model3 = _ref[2];
      el1 = a.getElByModel(model1);
      el2 = a.getElByModel(model2);
      el3 = a.getElByModel(model3);
      ut.assertSiblings(el1, el2);
      return ut.assertSiblings(el2, el3);
    });
    it('should use the `modelTemplate` option to construct the DOM', function() {
      var $children, a;
      a = new FastCollectionView({
        collection: new Giraffe.Collection({
          foo: 'bar'
        }),
        modelTemplate: '<li><%= attributes.foo %></li>',
        modelTemplateStrategy: 'underscore-template'
      });
      $children = a.$el.children();
      assert.lengthOf($children, 0);
      a.render();
      $children = a.$el.children();
      assert.lengthOf($children, 1);
      a.addOne({
        foo: 'baz'
      });
      $children = a.$el.children();
      assert.lengthOf($children, 2);
      assert.equal('bar', $children.first().text());
      return assert.equal('baz', $children.last().text());
    });
    it('should use `modelSerialize` to send custom data to the template', function() {
      var a;
      a = new FastCollectionView({
        collection: new Giraffe.Collection({
          foo: 'bar'
        }),
        modelTemplate: '<li><%= foo %></li>',
        modelTemplateStrategy: 'underscore-template',
        modelSerialize: function() {
          var data;
          data = this.model.toJSON();
          data.cid = this.model.cid;
          return data;
        }
      });
      assert.ok(!a.$el.text());
      a.render();
      return assert.equal('bar', a.$el.text());
    });
    it('should insert the model views in `modelEl` if provided', function() {
      var a, className;
      className = 'my-model-view-el';
      a = new FastCollectionView({
        modelEl: '.' + className,
        templateStrategy: function() {
          return "<ul class='" + className + "'></ul>";
        },
        modelTemplate: '<li><%= attributes.foo %></li>',
        modelTemplateStrategy: 'underscore-template'
      });
      a.addOne({
        foo: 'bar'
      });
      return ut.assertHasText(a, 'bar', className);
    });
    it('should accept View#ui names for `modelEl`', function() {
      var a, className;
      className = 'my-model-view-el';
      a = new FastCollectionView({
        ui: {
          $myModelEl: '.' + className
        },
        modelEl: '$myModelEl',
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        },
        modelTemplate: '<li><%= attributes.foo %></li>',
        modelTemplateStrategy: 'underscore-template'
      });
      a.addOne({
        foo: 'bar'
      });
      return ut.assertHasText(a, 'bar', className);
    });
    return it('should accept `appEvents` as an option', function() {
      return ut.assertAppEventsOption(FastCollectionView, 0, fcvDefaults);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=fastCollectionViewTest.map
*/