function onCreate()
    for i = 0, getProperty('unspawnNotes.length')-1 do
        if getPropertyFromGroup('unspawnNotes', i, 'noteType') == 'bf' then
            setPropertyFromGroup('unspawnNotes', i, 'texture', 'pNotes2i')
            setPropertyFromGroup('unspawnNotes', i, 'noAnimation', true)
            setPropertyFromGroup('unspawnNotes', i, 'alpha', 0)

            -- mark the note with the shader name so engine/editor hooks can pick it up
            pcall(function()
                setPropertyFromGroup('unspawnNotes', i, 'shader', 'pNotePulse')
            end)

            if getPropertyFromGroup('unspawnNotes', i, 'mustPress') then
                setPropertyFromGroup('unspawnNotes', i, 'ignoreNote', true)
            end
        end
    end
end

function onSpawnNote(id, member, index, time)
    if getPropertyFromGroup('notes', id, 'noteType') == 'bf' then
        setPropertyFromGroup('notes', id, 'texture', 'pNotes2i')
        setPropertyFromGroup('notes', id, 'noAnimation', true)
        setPropertyFromGroup('notes', id, 'alpha', 0)

        -- try to attach shader metadata to the spawned note (harmless if engine ignores it)
        pcall(function()
            setPropertyFromGroup('notes', id, 'shader', 'pNotePulse')
        end)

        if getPropertyFromGroup('notes', id, 'mustPress') then
            setPropertyFromGroup('notes', id, 'ignoreNote', true)
        end
    end
end

-- Optional: If your engine exposes functions to create and apply shaders from Lua,
-- this file will be ready to use the `shader` property set above. If not, follow
-- the instructions in custom_notetypes/bf_shader_instructions.md to register the
-- shader with the engine/editor and apply it to the "pNotes2i" texture or to
-- objects whose metadata `shader` is "pNotePulse".

function onUpdatePost(elapsed)
    for i = getProperty('notes.length')-1, 0, -1 do
        if getPropertyFromGroup('notes', i, 'noteType') == 'bf' then
            setPropertyFromGroup('notes', i, 'alpha', 0)

            if getSongPosition() > getPropertyFromGroup('notes', i, 'strumTime') then
                local noteData = getPropertyFromGroup('notes', i, 'noteData')
                local anim = ''

                if noteData == 0 then
                    anim = 'singLEFT'
                elseif noteData == 1 then
                    anim = 'singDOWN'
                elseif noteData == 2 then
                    anim = 'singUP'
                elseif noteData == 3 then
                    anim = 'singRIGHT'
                end

                triggerEvent('Play Animation', anim, 'boyfriend')

                -- On trigger: attempt to run a small Haxe snippet to pulse shader time if available.
                -- This is wrapped in pcall so it won't error on engines without runHaxeCode.
                pcall(function()
                    local ok, res = pcall(runHaxeCode, [[
                        // This Haxe snippet assumes you loaded a shader called 'pNotePulse' and
                        // bound it to the texture 'pNotes2i' or objects named with 'shader' metadata.
                        // Implementation depends on your engine build; see bf_shader_instructions.md
                    ]])
                end)

                removeFromGroup('notes', i)
            end
        end
    end
end
