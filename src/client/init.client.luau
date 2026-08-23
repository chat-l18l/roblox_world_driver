--!strict
--[[
	M0-client: laat zien welke build draait, en verder niets.

	Dit label is het acceptatiecriterium van M0. Zie je het in Studio en straks in
	de test-place, dan staat de hele keten: bestand -> Rojo -> place -> Roblox.

	De client beslist niets en zal dat ook nooit doen; zie AGENTS.md.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Version = require(Shared:WaitForChild("Version"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local gui = Instance.new("ScreenGui")
gui.Name = "BuildInfo"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local label = Instance.new("TextLabel")
label.Name = "Version"
label.AnchorPoint = Vector2.new(0.5, 0)
label.Position = UDim2.new(0.5, 0, 0, 16)
label.Size = UDim2.fromOffset(420, 44)
label.BackgroundColor3 = Color3.fromRGB(28, 36, 48)
label.BackgroundTransparency = 0.12
label.TextColor3 = Color3.fromRGB(243, 238, 228)
label.Font = Enum.Font.SourceSansBold
label.TextSize = 20
label.Text = `Wereldpost · build {Version.commit} · {Version.builtAt}`
label.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = label
