{assert} = chai


describe 'Giraffe.App', ->

  it 'should be OK', ->
    assert.ok new Giraffe.App

  it 'should add an initializer and call it on `start`', (done) ->
    a = new Giraffe.App
    a.addInitializer -> done()
    a.start()

  it 'should accept appEvents on extended class', (done) ->
    MyApp = Giraffe.App.extend
      appEvents:
        'app:initialized': -> done()
    app = new MyApp
    app.start()

  it 'should accept appEvents as an option', (done) ->
    app = new Giraffe.App
      appEvents:
        'app:initialized': -> done()
    app.start()