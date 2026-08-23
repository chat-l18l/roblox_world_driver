--!strict
--[[
	M0-server: alleen compositie, geen spelregels.

	De wereld (vloer, spawn) staat in default.project.json en bestaat dus al na
	Connect, zonder Play. Dat is bewust: een lege Explorer na Accept is waar het
	vorige project op strandde.

	Vanaf M2 hoort hier het opbouwen van een regiobord uit Board.plan(), en niets
	anders dan het uitvoeren van die bouwlijst.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Version = require(Shared:WaitForChild("Version"))

print(`[Wereldpost] server op, build {Version.commit} ({Version.builtAt})`)
