-- PlayVideo with HUD Custom Event for Psych Engine v1.0.4
-- Shows a HUD element while playing a video

function onEvent(name, value1, value2)
    if name == 'PlayVideoWithHUD' then
        playVideoWithHUD(value1, value2)
    end
end

function playVideoWithHUD(videoPath, hudElement)
    -- Validate inputs
    if not videoPath or videoPath == '' then
        debugPrint('Error: No video path provided')
        return
    end
    
    -- Default HUD element if not specified
    if not hudElement or hudElement == '' then
        hudElement = 'default'
    end
    
    -- Create video sprite
    local video = makeSprite(0, 0, videoPath)
    if video then
        video.setGraphicSize(screenWidth, screenHeight)
        video.updateHitbox()
        add(video)
        
        -- Show HUD element
        showHUDElement(hudElement)
        
        -- Handle video playback
        if video.animation then
            video.animation.play('idle', true)
        end
        
        debugPrint('PlayVideo started with HUD: ' .. hudElement)
    else
        debugPrint('Error: Could not load video from ' .. videoPath)
    end
end

function showHUDElement(elementType)
    local hudSprite = makeSprite(0, 0, 'hud_' .. elementType)
    
    if hudSprite then
        hudSprite.scrollFactor.set(0, 0)
        hudSprite.cameras = {camHUD}
        add(hudSprite)
        
        debugPrint('HUD element shown: ' .. elementType)
    else
        debugPrint('Warning: Could not load HUD element: ' .. elementType)
    end
end

function onDestroy()
    -- Cleanup when event ends
    debugPrint('PlayVideoWithHUD event cleaned up')
end
