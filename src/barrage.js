(function ($) {
    'use strict';

    function makeComment (comment) {
        try {
            comment = $.parseHTML(comment);
        } catch( e ) {
            console.error('invalid comment: ' + e.message);
            return null;
        }

        comment = $(comment).text();
        comment = $.parseHTML('<div><span>' + comment + '</span></div>');
        comment = $(comment);

        return comment;
    }

    function Barrage (ctx, options) {
        this.$ctx = $(ctx);
        this.options = options;

        this.$ctx.addClass('barrage');
        this.$ctx.data('disabled', false);
    }

    Barrage.prototype.adjustOverlap = function ($comment) {
        var $ctx = this.$ctx;
        var space = $comment.parent().innerWidth() / 2;
        var bound = {
            top: $comment.position().top,
            bottom: $comment.position().top + $comment.outerHeight(true),
            left: $comment.position().left - space,    // leave space to avoid overlap by speed
            right: $comment.position().left + $comment.outerWidth(true),
        };
        $('div.comment', $ctx).each(function (i, v) {
            var b = $(v);
            b = {
                top: b.position().top,
                bottom: b.position().top + b.outerHeight(true),
                left: b.position().left,
                right: b.position().left + b.outerWidth(true),
            };
            if (b.left < bound.right && b.right > bound.left && b.top < bound.bottom && b.bottom > bound.top) {
                var offset = $comment.outerHeight(true);
                $comment.css({
                    top: $comment.position().top + offset,
                });
                bound.top += offset;
                bound.bottom += offset;
                if (bound.bottom > $comment.parent().innerHeight()) {
                    console.log('comment overflow: ' + $comment.text());
                }
            }
        });
    };

    Barrage.prototype.addComment = function (comment) {
        var $comment = makeComment(comment);
        if (!$comment) {
            return;
        }

        var $ctx = this.$ctx;
        $ctx.append($comment);

        var width = $comment.parent().width();
        $comment.css({
            left: width,
        });
        this.adjustOverlap($comment);
        var tmp = $comment.outerWidth(true) + width;
        $comment.css({
            transition: 'transform 4s linear',
            transform: 'translateX(-' + tmp + 'px)',
        });
        $comment.on('transitionend webkitTransitionEnd', function() {
            $(this).remove();
        });
        $comment.addClass('comment');
        if ($ctx.data('disabled')) {
            $comment.addClass('barrage-hidden');
        }
    };

    Barrage.prototype.toggleComment = function () {
        var $ctx = this.$ctx;
        $ctx.data('disabled', !$ctx.data('disabled'));

        if ($ctx.data('disabled')) {
            $ctx.children().addClass('barrage-hidden');
        } else {
            $ctx.children().removeClass('barrage-hidden');
        }
    };

    Barrage.prototype.enable = function () {
        var $ctx = this.$ctx;
        $ctx.data('disabled', false);
        $ctx.children().removeClass('barrage-hidden');
    };

    Barrage.prototype.disable = function () {
        var $ctx = this.$ctx;
        $ctx.data('disabled', true);
        $ctx.children().addClass('barrage-hidden');
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('_.barrage');
            var options = typeof option === 'object' && option;

            if (!data) {
                data = new Barrage(this, options);
                $this.data('_.barrage', data);
            }

            if (option === 'add') {
                data.addComment(args[0]);
            } else if (option === 'toggle') {
                data.toggleComment();
            } else if (option === true) {
                data.enable();
            } else if (option === false) {
                data.disable();
            }
        });
    }

    var old = $.fn.barrage;

    $.fn.barrage = Plugin;

    $.fn.barrage.noConflict = function () {
        $.fn.barrage = old;
        return this;
    };

})(jQuery);
