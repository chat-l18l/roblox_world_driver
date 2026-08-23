--!strict
--[[
	Welke build draait er?

	Lokaal blijft dit "dev". De CI overschrijft dit bestand vlak voor `rojo build`
	met de korte commit-hash en de bouwtijd, zodat je op het scherm in de place
	kunt zien welke commit je speelt. Dat is precies wat ontbrak toen het project
	"niet werkte": geen enkele manier om te zien wat er draaide.

	Niet met de hand bewerken.
]]

return {
	commit = "dev",
	builtAt = "lokaal",
}
