--!strict
--[[
	Headless testrunner voor de pure kern. Draait onder Lune, zonder Roblox:

		lune run tools/run_tests.luau

	Suites staan hieronder expliciet in een lijst in plaats van automatisch
	gevonden te worden. Dat is een regel per testbestand, en het houdt de
	requires statisch — geen magie die stilletjes een suite overslaat.
]]

local process = require("@lune/process")
local stdio = require("@lune/stdio")

type Suite = { [string]: () -> () }

local SUITES: { { name: string, tests: Suite } } = {
	{ name = "Contract", tests = require("../tests/unit/ContractTest") },
}

local passed = 0
local failed = 0

for _, suite in SUITES do
	print(`\n{suite.name}`)

	-- Gesorteerd, zodat de uitvoer tussen runs identiek is en een diff iets zegt.
	local names: { string } = {}
	for name in suite.tests do
		table.insert(names, name)
	end
	table.sort(names)

	for _, name in names do
		local ok, err = pcall(suite.tests[name])
		if ok then
			passed += 1
			print(`  ok   {name}`)
		else
			failed += 1
			print(`  FOUT {name}`)
			print(`       {tostring(err)}`)
		end
	end
end

print(`\n{passed} geslaagd, {failed} gefaald`)

if failed > 0 then
	stdio.ewrite("tests gefaald\n")
	process.exit(1)
end

process.exit(0)
