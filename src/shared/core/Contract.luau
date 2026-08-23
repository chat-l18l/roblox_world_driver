--!strict
--[[
	Poortwachter-helpers, Hintjens-stijl.

	Ongeldige invoer is een bug van de aanroeper, geen speler-fout: we stoppen
	meteen en wijzen naar de aanroepregel, in plaats van stil te corrigeren.

	Waarom error(msg, 2) en niet assert(): assert wijst de stacktrace naar assert
	zelf, terwijl niveau 2 een frame omhoog wijst — precies waar de fout gemaakt is.

	Deze module is PUUR: geen Roblox-API, geen globals. Zie AGENTS.md.
]]

local Contract = {}

--[[
	Faalt als cond onwaar is. Gebruik dit aan de poort van elke publieke functie.
	Na deze poort ga je ervan uit dat de invoer klopt: geen dubbele nil-checks.
]]
function Contract.require(cond: boolean, msg: string): ()
	if not cond then
		error("contract geschonden: " .. msg, 2)
	end
end

--[[
	Faalt als value nil is, en geeft anders value terug zodat je kunt ketenen:
		local place = Contract.present(places[id], "place " .. id)
]]
function Contract.present<T>(value: T?, name: string): T
	if value == nil then
		error("contract geschonden: " .. name .. " ontbreekt", 2)
	end
	return value :: T
end

--[[
	Faalt als n buiten [lo, hi] valt. Bedoeld voor parameters met een bereik dat
	de aanroeper hoort te kennen, zoals een schaal of een moeilijkheidsgraad.
]]
function Contract.inRange(n: number, lo: number, hi: number, name: string): number
	if n ~= n or n < lo or n > hi then
		error(`contract geschonden: {name} = {n}, verwacht tussen {lo} en {hi}`, 2)
	end
	return n
end

return Contract
