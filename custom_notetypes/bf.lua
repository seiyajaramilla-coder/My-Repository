function onCreate()
    for i = 0, getProperty('unspawnNotes.length')-1 do
        if getPropertyFromGroup('unspawnNotes', i, 'noteType') == 'bf' then
            setPropertyFromGroup('unspawnNotes', i, 'texture', 'pNotes2i')
            setPropertyFromGroup('unspawnNotes', i, 'noAnimation', true)
            setPropertyFromGroup('unspawnNotes', i, 'alpha', 0)

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

        if getPropertyFromGroup('notes', id, 'mustPress') then
            setPropertyFromGroup('notes', id, 'ignoreNote', true)
        end
    end
end

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
                removeFromGroup('notes', i)
            end
        end
    end
end
