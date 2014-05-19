function LimitDrag(id){
	Drag.call(this, id);
}

for(var i in Drag.prototype){
	LimitDrag.prototype[i] = Drag.prototype[i];
}

LimitDrag.prototype.fnMove=function(ev){
	var oEvent=ev||event;
	var l=oEvent.clientX-this.disX;
	var t=oEvent.clientY-this.disY;
}