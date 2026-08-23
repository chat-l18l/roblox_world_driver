--!strict
--[[
	Minimale assertions voor de Lune-testrunner.

	Waarom geen framework in M0: jest-lua of TestEZ erbij halen kost een
	Wally-afhankelijkheid en een spike, en M0 gaat over de keten, niet over
	de testinfrastructuur. Zodra de matchers knellen, is dat het signaal om
	de keuze in M1 te maken. Zie docs/04-testen-en-ci.md.
]]

local Assert = {}

function Assert.equal<T>(actual: T, expected: T, what: string): ()
	if actual ~= expected then
		error(`{what}: verwacht {tostring(expected)}, kreeg {tostring(actual)}`, 2)
	end
end

function Assert.truthy(value: any, what: string): ()
	if not value then
		error(`{what}: verwacht waar, kreeg {tostring(value)}`, 2)
	end
end

--[[
	Verwacht dat fn() een fout gooit waarvan de boodschap `contains` bevat.
	Zonder die inhoudscheck slaagt de test ook op een tikfout in de functie zelf.
]]
function Assert.errors(fn: () -> (), contains: string, what: string): ()
	local ok, err = pcall(fn)
	if ok then
		error(`{what}: verwacht een fout, maar er kwam geen`, 2)
	end
	local message = tostring(err)
	if not string.find(message, contains, 1, true) then
		error(`{what}: fout bevat "{contains}" niet -> {message}`, 2)
	end
end

return Assert
