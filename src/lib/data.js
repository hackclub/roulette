
export function getCurrentRound(){
  return 1;
}



export const choices = {
    "camera": {
        "2d top down": {
            "description": "like you're looking straight down. usually the player moves in 4- or 8- directions.",
            "examples": {
                "stardew valley": "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_1.5/c_scale,w_500/ncom/software/switch/70010000001801/6016d2f6d874ad4a1063a28181597427f6fe9ee207ce3c8351c10dda377b3bb4",
                "snake": "https://www.snakegame.net/media/google-snake-game.png",
                "undertale": "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_1.5/c_scale,w_500/ncom/software/switch/70010000009921/0a9194c2df87a1a28b9b55dea51f52089bb35f0b72e4f9f9d8cec4689e4e99af",
                "the binding of isaac": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/113200/ss_d2dd031f581bcad380ed5a6065c8908329cf1115.1920x1080.jpg?t=1643480517"
            }
        },
        "2d side scrolling": {
            "description": "viewing the action from the side. player usually moves left/right and jumps.",
            "examples": {
                "hollow knight": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/ss_47f3523dbea462aff2ca4bc9f605faaf80a792b2.1920x1080.jpg?t=1695270428",
                "celeste": "https://www.syfy.com/sites/syfy/files/styles/scale_862/public/3344817-celeste_1.jpg",
                "terraria": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_8c03886f214d2108cafca13845533eaa3d87d83f.1920x1080.jpg?t=1731252354",
                "super mario bros": "https://www.nintendo.com/eu/media/images/10_share_images/games_15/virtual_console_nintendo_3ds_7/SI_3DSVC_SuperMarioBros.jpg"
            }
        },
        "2d isometric": {
            "description": "angled view where you see two vertical sides of the environment. can be in 2d or 3d.",
            "examples": {
                "hades": "https://assets1.ignimgs.com/2020/09/29/switch-hades-screenshot-3-1601347618169.jpg",
                "rollercoaster tycoon classic": "https://assets.nintendo.com/image/upload/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000088763/b54b376160b3e4b69c91517cb5d32d21393ac65e7500413d9b3a5ee9a0bec054",
                "bastion": "https://assets.nintendo.com/image/upload/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000010936/e8be9269e8c56b0378da18cf3747add3de1d4369cc3c91ed81d0584a8e156373",
                "monument valley": "https://blog.richersounds.com/wp-content/uploads/2022/10/MV_FS_Thief.0.0.jpeg"
            }
        },
        "3d first person": {
            "description": "the camera sees the world from the character's point of view.",
            "examples": {
                "minecraft": "https://minecraft.wiki/images/thumb/Survival.png/427px-Survival.png?b8898",
                "portal": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/400/0000002586.1920x1080.jpg?t=1745368554",
                "slime rancher": "https://www.cyberpowerpc.com/blog/w/wp-content/uploads/2016/04/ss_ff0317116fc7f39aa3279637523d68920eb243d8.1920x1080.jpg",
                "subnautica": "https://i.ytimg.com/vi/QQUBLtRcYPA/maxresdefault.jpg"
            }
        },
        "3d third person": {
            "description": "the camera follows a character.",
            "examples": {
                "journey": "https://lh3.googleusercontent.com/btaPEE89l95SeM_ihzqMSHNSID1ASUgiG41Ml64uCKbi4LtM1fzAB4s0klihVMHM8OJS1zrHxSVv44OFYbcGmnWo3TOV7CEbYa0lwBw6h_p3icp4focP0ur-2mJcdJwdSyILOk0",
                "a short hike": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1055540/ss_4c7c9650606ac7b451f8d2e5b71b503649e43edc.1920x1080.jpg?t=1734538147",
                "psychonauts": "https://i.ytimg.com/vi/RLDoys8ahOI/maxresdefault.jpg",
                "it takes two": "https://i.ytimg.com/vi/sW-lpUtSGdo/maxresdefault.jpg"
            }
        },
        "2.5d": {
            "description": "gameplay is mostly 2d, but uses 3d models/depth effects.",
            "examples": {
                "cult of the lamb": "https://cdn.dlcompare.com/others_jpg/upload/news/image/cult-of-the-lamb-gameplay-guide-image-ef493a14.jpeg.webp",
                "animal crossing": "https://static1.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/16342471/Switch_AnimalCrossingNH_E3_screen_07.jpg",
                "little nightmares": "https://i.ytimg.com/vi/kvhI27s8gL8/maxresdefault.jpg",
                "octopath traveller": "https://d.player.one/en/full/215069/square-enix-has-shown-off-20-minutes-new-gameplay-footage-octopath-traveler-ii.jpg?w=1600&h=1200&q=88&f=3a3e0d0cbc4e77b919d0e20e82d57b7e"
            }
        },
        "interface-based": {
            "description": "no world camera - play through menus, buttons, and ui screens.",
            "examples": {
                "balatro": "https://i.guim.co.uk/img/media/6e67f271b1a0a0cc29c4b99e97d5f49dfcde446c/0_19_1719_1031/master/1719.jpg?width=700&quality=85&auto=format&fit=max&s=a40e6a43e38df7aa2bc5fa1dce430ed5",
                "papers, please": "https://media.npr.org/assets/img/2013/11/11/shot05-brothel_wide-3c71f72d1d1c2e9442823b9d53dfcc8a5110b993.png?s=1400&c=100&f=png",
                "osu": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvN3-kgubLZeLSc0mjwfYVlF0g1kEly5W9nw&s",
                "mini metro": "https://play-lh.googleusercontent.com/Y_QtZy3w7MXM9J5olgQR2t3BeYfrFS-8bsT9T20u5vkOXMQUtJkaa2hM9cqrFMXJ7g=w526-h296-rw"
            }
        }
    },
    "gameplay": {
        "puzzle": {
            "description": "solve problems using logic or pattern-recognition to progress.",
            "examples": {}
        },
        "platformer": {
            "description": "navigate through platforms and obstacles to progress.",
            "examples": {}
        },
        "arcade": {
            "description": "typically in rounds or waves, use quick reflexes and hit high scores.",
            "examples": {}
        },
        "rhythm": {
            "description": "use rhythm or music-based inputs, such as being on beat or on tune.",
            "examples": {}
        },
        "story-based": {
            "description": "rpg/visual novel/quest-centric games that emphasize the narrative or character development.",
            "examples": {}
        },
        "survival": {
            "description": "collect resources, explore, and stay alive!",
            "examples": {}
        },
        "management": {
            "description": "manage your inventory, resources, people, or systems effectively.",
            "examples": {}
        },
        "combat": {
            "description": "fight and battle!",
            "examples": {}
        },
        "stealth": {
            "description": "be sneaky and avoid detection.",
            "examples": {}
        },
        "exploration": {
            "description": "usually open-world, explore and discover new things!",
            "examples": {}
        },
        "deckbuilder": {
            "description": "build and customise a deck of cards — then use those cards to progress.",
            "examples": {}
        },
        "clicker": {
            "description": "repeat actions (usually via clicking) to progress the game",
            "examples": {}
        }
    },
    "setting": {
        "nature": {
            "description": "",
            "examples": {}
        },
        "urban": {
            "description": "",
            "examples": {}
        },
        "futuristic": {
            "description": "",
            "examples": {}
        },
        "dystopian": {
            "description": "",
            "examples": {}
        },
        "surreal": {
            "description": "",
            "examples": {}
        },
        "digital": {
            "description": "",
            "examples": {}
        },
        "fantasy": {
            "description": "",
            "examples": {}
        },
        "non-world": {
            "description": "",
            "examples": {}
        }
    }
}




export function isSelectedCountOk(selectedOptions, wheelOption ) {
  const totalCount = choices[wheelOption].length;
  const limit = Math.ceil(0.33 * totalCount);
  const totalLeft = totalCount - limit;
  if (selectedOptions.length < totalLeft) {
    return false
  }
  else {
    console.log("SELECTION OK")
    return true
  }


}
