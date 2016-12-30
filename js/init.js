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
        console.log("Comparing: "+$(this).attr("href")+" with "+name);
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
            for(var z=0; z< callBack[i].checkItems.length;z++){
              var link = callBack[i].checkItems[z].name;
              self.api.card.get(self.getCardIdFromLink(link),function(cardCallBack){
                self.api.list.get(cardCallBack.idList,function(listCallBack){
                    self.api.board.get(cardCallBack.idBoard,function(boardCallback){
                        self.renameChild(cardCallBack.url,listCallBack.name,boardCallback.name);
                    });
                });

              });
            }
          }
        }
      });
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
    }
  }
  $(document).ready(function(){
    HandsomeTrello.init();
  });
})();
