{assert} = chai
{ut} = window


describe 'Giraffe.plugins', ->

  it 'should be OK', ->
    assert.ok Giraffe.plugins

  it 'should add a plugin', ->
    count = Giraffe.plugins.plugins.length
    Giraffe.plugins.add {}
    assert.lengthOf Giraffe.plugins.plugins, count + 1

  it 'should copy properties to the target functions\' prototypes', ->
    class Foo
    Giraffe.plugins.add targets: [Foo], extendPrototype: {bar: 'baz'}
    assert.equal 'baz', Foo::bar
    assert.notEqual 'baz', Giraffe.View::bar