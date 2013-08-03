{assert} = chai

describe 'Giraffe.App', ->

  it 'should be OK', ->
    app = new Giraffe.App
    assert.ok app

  it 'should accept appEvents', (done) ->
    `
    var MyApp = Giraffe.App.extend({
      appEvents: {
        'all': 'catchAll'
      },
      catchAll: function() {
        done()
      }
    });
    `
    app = new MyApp
    app.start()

