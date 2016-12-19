var STKit = (function () {
    var memoizer = function(factorial) {
        var a = {};
        return function() {
            var key = arguments.length + Array.prototype.join(arguments, ",");
            a[key] = factorial.apply(this, arguments);
            return a[key];
        };
    };
    var isArrayLike = function (obj) {
        if(obj && typeof obj == "object" && isFinite(obj.length) && obj.length>=0 ){
            return true;
        }else
            return false
    };
    var debehaviorize = function (obj) {
        if (Object.isSealed(obj) || Object.isFrozen(obj)) {
            return "Sealed || Frozen";
        }
        for (var prop in obj) {
            if (typeof obj[prop] === 'object') {
                if (Object.getOwnPropertyDescriptor(obj, prop).configurable == false) {
                    return "Filed non-configurable";
                }
                debehaviorize(obj[prop]);
            }
            else if (typeof obj[prop] === 'function') {
                if (Object.getOwnPropertyDescriptor(obj, prop).configurable == false) {
                    return "Filed non-configurable";
                }
                delete obj[prop];
            }
        }
        return obj;
    };

    var parseData = function (data) {
        var props = data.split(":");
        var obj = {};
        var p = props[0].split(";");
        if(p[0]=="")
            p.shift();
        if(p[p.length-1]=="")
            p.pop();
        for(var i=0;i<p.length;i++) {
            var p1 = p[i].split(",");
            if(p1[1]!=null) {
                obj[p1[0]] = p1[1];
                var subString = p1[1].substr(0,9);
              if(subString === "|function"){
                  var args;
                  if(p1[1].match(/\((.+)\)/)!=null) {
                      args=p1[1].match(/\((.+)\)/)[1];
                  }
                  obj[p1[0]] = new Function(args,p1[1].match(/{([^}]+)}/)[1])
              }

            }
        }
        var props2 = props[1].split(";");
        if(props2[0]=="")
            props2.shift();
        if(props2[props2.length-1]=="")
            props2.pop();
        var o = [];
        for(var i=0;i<props2.length;i++) {
            var p2 = props2[i].split(",");
            o[p2[0]]=p2[1];
        }
        obj[p[p.length-1]]=o;
        return obj;
    };


    return {
        memoizer: memoizer,
        isArrayLike: isArrayLike,
        debehaviorize : debehaviorize,
        parseData : parseData
    };
})();





(function() {
    function factorial(n) {
        var res = 1;
        while (n!=1){
            res *=n--;
        }
        return res;
    }
    var factorialMemo = STKit.memoizer(factorial);
    console.log(factorialMemo(3));
    console.log(factorialMemo(8));
    function summ(a,b) {
        return a+b;
    }
    factorialMemo = STKit.memoizer(summ);
    console.log(factorialMemo(3,5));
    console.log(factorialMemo(8,1));
    var a = {};
    for(var i = 0;i<25;i++){
        a[i] = i;
    }
    console.log(STKit.isArrayLike(a));
    a.length = 25;
    console.log(STKit.isArrayLike(a));
    var obj = {
        objProp:{
            func: function () {
                return 0;
            },
            field: 0
        },
        strProp: {
            str: "str" ,
            str2: "str2"
        },
        number: 333,
        func: function () {
            return true;
        }
    };
    console.log(obj);
    console.log(STKit.debehaviorize(obj));
    console.log(STKit.parseData(";key,value;key2,value2;method,|function () { return true }|;key3:k,1;k2,2;k3,3;"));

})();

