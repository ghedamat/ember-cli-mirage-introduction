import Ember from 'ember';

const { Component, $, isEmpty } = Ember;

export default Component.extend({
  didInsertElement() {
    let slideshow = remark.create({
			highlightLanguage: 'javascript',
			highlightStyle: 'monokai',
      sourceUrl: this.get('source')
    });
    slideshow.on('showSlide', function() {
      Ember.run.next(function() {
        let video = $('.remark-visible .video:visible');
        if (!isEmpty(video)) {
          asciinema_player.core.CreatePlayer(video.attr('id'), video.data('src'), {
            width: 83,
            height: 24,
            autoPlay: true
          });
        }
      });
    })
  }
});
