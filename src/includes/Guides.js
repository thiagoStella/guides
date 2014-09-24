var Guides = function (element, options) {
    this.element = element;
    this.$element = $(element);
    this.options = {};
    this._current = 0;
    this.setOptions(options);
    this.$element.on('click.guides', $.proxy(this.start, this));
};

Guides.DEFAULTS = {
    distance: 100,
    color: '#fff',
    cssClass: '',
    guides: []
};

Guides.prototype.start = function(e) {
    if (e) {
        e.preventDefault();
    }
    if (this.$canvas) {
        return this;
    }
    this._current = 0;
    this._renderCanvas()
        ._renderGuide(this.options.guides[this._current])
        ._callback('start');
    return this;
};

Guides.prototype.end = function() {
    if (this.$canvas) {
        this.$canvas.remove();
        this.$canvas = null;
    }
    if (this._currentGuide) {
        this._currentGuide.destroy();
        this._currentGuide = null;
    }
    $(document).off('keyup.guides');    
    this._callback('end');
    return this;
};

Guides.prototype.next = function () {
    this.options.guides[this._current].element.removeClass('guides-current-element');
    this._renderGuide(this.options.guides[++this._current])
        ._callback('next');
    return this;
};

Guides.prototype.prev = function () {
    if (!this._current) {
        return;
    }
    this.options.guides[this._current].element.removeClass('guides-current-element');
    this._renderGuide(this.options.guides[--this._current])
        ._callback('prev');
    return this;
};

Guides.prototype.setOptions = function(options) {
    if (typeof options !== 'object') {
        return this;
    }
    this.options = $.extend({}, Guides.DEFAULTS, this.options, options);
};

Guides.prototype.destroy = function() {
    this.end();
    this.$element.off('click.guides');
    this._callback('destroy');
    return this;
};

Guides.prototype._callback = function (eventName) {
    var callback = this.options[eventName],
        eventObject = {
            sender: this
        };

    if (this._currentGuide) {
        eventObject.$element = this._currentGuide.guide.element;
        eventObject.$guide = this._currentGuide.$element;
    }

    if ($.isFunction(callback)) {
        callback.apply(this, [eventObject]);
    }
};

Guides.prototype._renderCanvas = function () {
    this.$canvas = $('<div />', {
            'class': 'guides-canvas guides-fade-in',
            'html': '<div class="guides-overlay"></div><div class="guides-mask"></div>'
        }).appendTo('body');
    this._bindNavigation();    
    return this;    
};

Guides.prototype._renderGuide = function (guide) {
    if (!guide) { //no more guides
        this.end();
        return this;
    }

    guide.element
        .addClass('guides-current-element');
    if (this._currentGuide) {
        this._currentGuide.destroy();
    }

    this._currentGuide = new Guide(guide, this.$canvas, this.options);
    return this;
};

Guides.prototype._bindNavigation = function () {
    this.$canvas.on('click.guides', $.proxy(this._onCanvasClick, this));
    $(document).on('keyup.guides', $.proxy(this._onDocKeyUp, this));
    return this;
};

Guides.prototype._onCanvasClick = function (e) {
    var windowMiddle = window.innerWidth / 2;
    if (e.clientX > windowMiddle) {
        this.next();
    } else {
        this.prev();
    }
};

Guides.prototype._onDocKeyUp = function (e) {
    switch (e.which) {
    case 27: //esc
        this.end();
        break;
    case 39: //right arrow
    case 32: //space
        this.next();
        break;
    case 37: //left arrow
    case 8: //backspace
        e.preventDefault();
        this.prev();
        break;
    default:
        break;
    }
};