--!strict
--[[
	Slice 1 client: WASD on the van, chase cam behind.
	A = left (steer +1 → +yaw). Same contract as src/game/input.ts.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Vehicle = require(Shared:WaitForChild("Sim"):WaitForChild("Vehicle"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local playerScripts = player:WaitForChild("PlayerScripts")

local root = workspace:WaitForChild("Wereldpost")
if root:GetAttribute("Ready") ~= true then
	root:GetAttributeChangedSignal("Ready"):Wait()
end
local found = root:WaitForChild("Van", 15)
if found == nil or not found:IsA("BasePart") then
	error("[Wereldpost] Van ontbreekt na sync. git pull, rojo serve herstarten, Connect, Play.")
end
local van = found :: BasePart

local VAN_Y = 1.5
local CAM_DIST = 28
local CAM_HEIGHT = 12
local LOOK_LIFT = 2.5

local keys: { [Enum.KeyCode]: boolean } = {}
local state = Vehicle.create(van.Position.X, van.Position.Z)

local function held(code: Enum.KeyCode): boolean
	return keys[code] == true
end

local function readInput(): Vehicle.DriveInput
	local throttle = 0
	local steer = 0
	if held(Enum.KeyCode.W) or held(Enum.KeyCode.Up) then
		throttle += 1
	end
	if held(Enum.KeyCode.S) or held(Enum.KeyCode.Down) then
		throttle -= 1
	end
	if held(Enum.KeyCode.A) or held(Enum.KeyCode.Left) then
		steer += 1
	end
	if held(Enum.KeyCode.D) or held(Enum.KeyCode.Right) then
		steer -= 1
	end
	return { throttle = throttle, steer = steer }
end

UserInputService.InputBegan:Connect(function(input: InputObject, processed: boolean)
	if processed then
		return
	end
	if input.UserInputType == Enum.UserInputType.Keyboard then
		keys[input.KeyCode] = true
	end
end)

UserInputService.InputEnded:Connect(function(input: InputObject)
	if input.UserInputType == Enum.UserInputType.Keyboard then
		keys[input.KeyCode] = false
	end
end)

task.defer(function()
	local module = playerScripts:FindFirstChild("PlayerModule")
	if module and module:IsA("ModuleScript") then
		local ok, playerModule = pcall(require, module)
		if ok and playerModule then
			pcall(function()
				playerModule:GetControls():Disable()
			end)
			pcall(function()
				playerModule:GetCameras():SetTransition('Immediate')
			end)
		end
	end
end)

local gui = Instance.new("ScreenGui")
gui.Name = "SliceHud"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = playerGui

local chip = Instance.new("TextLabel")
chip.Name = "Hint"
chip.AnchorPoint = Vector2.new(0.5, 1)
chip.Position = UDim2.new(0.5, 0, 1, -28)
chip.Size = UDim2.fromOffset(420, 36)
chip.BackgroundColor3 = Color3.fromRGB(28, 36, 48)
chip.BackgroundTransparency = 0.15
chip.TextColor3 = Color3.fromRGB(243, 238, 228)
chip.Font = Enum.Font.SourceSansBold
chip.TextSize = 18
chip.Text = "WASD  ·  A = links  ·  slice 1"
chip.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = chip

local cam = workspace.CurrentCamera

local function placeCam()
	cam.CameraType = Enum.CameraType.Scriptable
	cam.CameraSubject = van
	local fwd = Vehicle.forward(state.yaw)
	local vanPos = Vector3.new(state.x, VAN_Y, state.z)
	local desired = vanPos + Vector3.new(0, CAM_HEIGHT, 0) + fwd * (-CAM_DIST)
	cam.CFrame = CFrame.new(desired, vanPos + Vector3.new(0, LOOK_LIFT, 0))
end

placeCam()

-- After Roblox's own camera (character cam), otherwise the avatar wins.
local CAMERA_PRIORITY = Enum.RenderPriority.Camera.Value + 10
RunService:BindToRenderStep("WereldpostCam", CAMERA_PRIORITY, function(dt: number)
	state = Vehicle.step(state, readInput(), dt)
	van.CFrame = Vehicle.cframeAt(state, VAN_Y)
	placeCam()
end)
