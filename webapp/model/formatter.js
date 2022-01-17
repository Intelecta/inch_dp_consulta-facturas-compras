sap.ui.define([

], function () {
	"use strict";

	return {

	    getCurrencyInstance: function(Amount){ 
            //Está configuración de los separados es por usuario
            //Si los campos de los separadores llega vacío por defecto se coloca lo siguiente:
            //groupingSeparator : "."  y decimalSeparator ","            
            //decimal, si este valor llega vacío, por defecto es 2            
            if(Amount != null){            
            var configUser = sap.ui.getCore().getModel("ConfigUser").getData(); 
            var settings;
            
            if(configUser.length > 0){
                settings = {"ThousandsSeparator": configUser[0].ThousandsSeparator,
                            "DecimalSeparator": configUser[0].DecimalSeparator,
                            "Decimals": configUser[0].Decimals}
            }
            else{
                settings = {"ThousandsSeparator": ".",
                            "DecimalSeparator": ",",
                            "Decimals": "2"}
            }
                             
            var oFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
                "currencyCode": false,
                "customCurrencies": {
                    "Custom": {                        
                        "decimals": settings.Decimals,                        
                    }
                },
                "groupingSeparator": settings.ThousandsSeparator ,
                "decimalSeparator": settings.DecimalSeparator,
                "showMeasure":false
            });
          
           var NumberFormat = oFormat.format(Number(Amount), "Custom");                     
           return NumberFormat;
         }
        }

	};
});