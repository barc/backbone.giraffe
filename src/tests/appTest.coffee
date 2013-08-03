{assert} = chai

describe 'Giraffe.App', ->

  it 'should be OK', ->
    app = new Giraffe.App
    assert.ok app

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

