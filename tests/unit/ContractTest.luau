--!strict
--[[
	Tests voor de poortwachter. Klein, maar niet triviaal: als Contract stil
	faalt of juist te vroeg gilt, verschuift dat het gedrag van elke module
	die erop leunt.
]]

local Assert = require("../Assert")
local Contract = require("../../src/shared/core/Contract")

return {
	["require laat een ware voorwaarde door"] = function()
		Contract.require(true, "mag niet falen")
	end,

	["require gooit met de reden erin"] = function()
		Assert.errors(function()
			Contract.require(false, "speler ontbreekt")
		end, "speler ontbreekt", "require")
	end,

	["present geeft de waarde terug zodat je kunt ketenen"] = function()
		Assert.equal(Contract.present(42, "getal"), 42, "present")
	end,

	["present gooit op nil met de naam erin"] = function()
		Assert.errors(function()
			Contract.present(nil, "place nl-utrecht")
		end, "place nl-utrecht", "present")
	end,

	["present laat false door, want false is een waarde"] = function()
		Assert.equal(Contract.present(false, "vlag"), false, "present false")
	end,

	["inRange laat de grenzen zelf toe"] = function()
		Assert.equal(Contract.inRange(1, 1, 5, "graad"), 1, "ondergrens")
		Assert.equal(Contract.inRange(5, 1, 5, "graad"), 5, "bovengrens")
	end,

	["inRange gooit buiten het bereik"] = function()
		Assert.errors(function()
			Contract.inRange(6, 1, 5, "graad")
		end, "graad", "inRange boven")
	end,

	["inRange gooit op NaN"] = function()
		Assert.errors(function()
			Contract.inRange(0 / 0, 1, 5, "graad")
		end, "graad", "inRange NaN")
	end,
}
