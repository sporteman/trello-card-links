(function () {
  'use strict';
  HandsomeTrello = {
    plugins: HandsomeTrello.plugins,
    api: HandsomeTrello.api,

    data : {
      regexp: {
        boardPathname: /^\/b\/([a-zA-Z0-9]+)/,
        cardId: /#([0-9]+)/,
        cardIdFromLink: /\/c\/[a-zA-Z0-9]+\/([0-9]+)/,
        cardShortLink: /\/c\/([a-zA-Z0-9]+)/,
        cardPathname: /^\/c\/([a-zA-Z0-9]+)/
      }
    },
    isJSONString: function (string) {
      try {
        JSON.parse(string);
      } catch (e) {
        return false;
      }
      return true;
    },
    generateParamsStringFromObject: function (object) {
      var stringData = '';

      for (var key in object) {
        if (stringData !== '') {
          stringData += '&';
        }
        stringData += key + '=' + encodeURIComponent(object[key]);
      }

      return stringData;
    },
    isAnyCardOpened: function(){
      return $('.window-overlay').css('display') != "none";
    },
    renameChild : function(name,listName,boardName){
      var self = this;

      $(".checklist").find($(".checklist-items-list .known-service-link")).each(function(index){
        if ( self.getCardNumber($(this).attr("href")) == self.getCardNumber(name) ){
          var text = $(this).text();
          var html = "<table>";
          html += "<tr><td colspan='2'><h3>"+text+"</h3></td></tr>";
          html += "<tr><td><b>Board</b></td><td><b>List</b></td></tr>";
          html += "<tr><td>"+boardName+"</td><td>"+listName+"</td></tr>";
          $(this).html(html);
        }
      });
    },
    processChildren : function(){
      var self = this;
      var cardId = self.getCardIdFromLink(window.location.pathname);
      self.api.checklist.getByCardId(cardId,function(callBack){
        if ( !callBack  )return;

        for(var i=0; i < callBack.length;i++){
          if ( callBack[i].name == "Children" ){
            self.processCard(callBack[i].id,callBack[i].checkItems,0);
          }
        }
      });
      $('.window-sidebar .window-module div').append('<a href="#" class="button-link js-sidebar-child-btn"> <span class="icon-sm handsome-icon-child"></span> Child</a>')
    },
    processCard: function(id,checkItems,index){
      var self = this;
      var link = checkItems[index].name;
      self.api.card.get(self.getCardIdFromLink(link),function(cardCallBack){
        self.api.list.get(cardCallBack.idList,function(listCallBack){
            self.api.board.get(cardCallBack.idBoard,function(boardCallback){
                self.renameChild(cardCallBack.url,listCallBack.name,boardCallback.name);
                if ( listCallBack.name.toUpperCase() == "DONE" ){
                  self.api.checklist.check(self.getCardIdFromLink(window.location.pathname),checkItems[index].idChecklist,checkItems[index].id
                  ,function(){
                    console.log("Clicked");
                  });
                }
                if ( index < checkItems.length-1 ){
                  self.processCard(id,checkItems,index+1);
                }
            });
        });
      });
    },
    getCardId: function (link) {
      var match = link.match(this.data.regexp.cardId);
      return match ? match[1] : false;
    },
    getCardNumber: function (link) {
      var match = link.match(this.data.regexp.cardIdFromLink);
      return match ? match[1] : false;
    },
    getCardIdFromLink: function (link) {
      var match = link.match(this.data.regexp.cardShortLink);
      return match ? match[1] : false;
    },
    init: function () {
      var self = this;
      self.api.base = self;
      self.api.checklist.base = self.api;
      self.api.card.base = self.api;
      self.api.list.base = self.api;
      self.api.board.base = self.api;
      var clickPopOver = function(){
        self.processChildren();
      }
      $('.list-card').click(clickPopOver);
      if (self.isAnyCardOpened()){
        self.processChildren();
      }
    },
    getCookie: function (name) {
      var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));

      return matches ? decodeURIComponent(matches[1]) : undefined;
    }
  }

  $(document).ready(function(){
    HandsomeTrello.init();
  });
})();
