// Tandem word bank.
//
// Each entry is a real compound word split [FIRST, SECOND] in the order the
// words actually combine (e.g. ['PENCIL', 'CASE'] -> "pencil case", not the
// reverse). Order matters in-game, so only fact-checked, real compounds
// belong here - no coincidental-spelling pairs (e.g. CAR+GO reads cute but
// "cargo" isn't car+go), no obscure splits a casual player won't recognize.
//
// A single word (e.g. BACK, WATER, FIRE, HOME) can legitimately appear in
// many different pairs across this bank - that's fine and expected, it's
// what makes the bank deep enough to pull fresh sets from. What's NOT fine
// is two pairs sharing a word ending up live on the board on the SAME day
// (see GAME_DESIGN.md "Generation"): if PAINT+BRUSH and TOOTH+BRUSH are both
// in the same day's pool, and PAINT/TOOTH are ever on-grid with BRUSH at the
// same time, which pair is "correct" becomes ambiguous. selectDailyPool()
// below enforces per-day word-uniqueness automatically - never slice
// WORD_BANK directly for a day's pool, always go through it.

export const WORD_BANK = [
  ['PENCIL', 'CASE'], ['PAINT', 'BRUSH'], ['TOOTH', 'PASTE'], ['TOOTH', 'PICK'],
  ['TOOTH', 'ACHE'], ['KEY', 'BOARD'], ['KEY', 'CHAIN'], ['KEY', 'HOLE'],
  ['KEY', 'STONE'], ['DOOR', 'BELL'], ['DOOR', 'KNOB'], ['DOOR', 'STEP'],
  ['DOOR', 'WAY'], ['DOOR', 'MAT'], ['BOOK', 'SHELF'], ['BOOK', 'CASE'],
  ['BOOK', 'MARK'], ['BOOK', 'WORM'], ['NOTE', 'BOOK'], ['NOTE', 'PAD'],
  ['DESK', 'TOP'], ['LAP', 'TOP'], ['BACK', 'PACK'], ['BACK', 'BONE'],
  ['BACK', 'GROUND'], ['BACK', 'YARD'], ['BACK', 'DROP'], ['BACK', 'FIRE'],
  ['BACK', 'STAGE'], ['BACK', 'STOP'], ['BACK', 'ACHE'], ['BACK', 'ROOM'],
  ['BACK', 'LOG'], ['BACK', 'SIDE'], ['BACK', 'SPACE'], ['BACK', 'TRACK'],
  ['BACK', 'UP'], ['BACK', 'WARD'], ['BACK', 'WOODS'], ['BACK', 'HAND'],
  ['BACK', 'DOOR'], ['BACK', 'FIELD'], ['BACK', 'LASH'], ['BACK', 'SEAT'],
  ['BACK', 'STROKE'], ['BACK', 'SWING'], ['BACK', 'TALK'], ['BACK', 'COUNTRY'],
  ['BACK', 'BURNER'], ['BACK', 'BEAT'], ['BACK', 'ORDER'], ['BACK', 'PEDAL'],
  ['BACK', 'SLIDE'], ['BACK', 'SPIN'], ['WALL', 'PAPER'],
  ['CUP', 'BOARD'], ['CUP', 'CAKE'], ['TEA', 'POT'], ['TEA', 'SPOON'],
  ['TEA', 'CUP'], ['BUTTER', 'FLY'], ['BUTTER', 'MILK'], ['BUTTER', 'CUP'],
  ['BUTTER', 'SCOTCH'], ['BUTTER', 'NUT'], ['HONEY', 'COMB'], ['HONEY', 'MOON'],
  ['HONEY', 'BEE'], ['HONEY', 'SUCKLE'], ['WATER', 'MELON'], ['WATER', 'FALL'],
  ['WATER', 'PROOF'], ['WATER', 'COLOR'], ['WATER', 'MARK'], ['WATER', 'SHED'],
  ['WATER', 'WAY'], ['RAIN', 'BOW'], ['RAIN', 'COAT'], ['RAIN', 'DROP'],
  ['RAIN', 'FALL'], ['RAIN', 'FOREST'], ['RAIN', 'STORM'], ['RAIN', 'WATER'],
  ['SNOW', 'FLAKE'], ['SNOW', 'MAN'], ['SNOW', 'BALL'], ['SNOW', 'STORM'],
  ['SNOW', 'PLOW'], ['SNOW', 'SHOE'], ['SNOW', 'SUIT'], ['SNOW', 'BOARD'],
  ['SNOW', 'FALL'], ['SUN', 'FLOWER'], ['SUN', 'SHINE'], ['SUN', 'RISE'],
  ['SUN', 'SET'], ['SUN', 'BURN'], ['SUN', 'SCREEN'], ['SUN', 'LIGHT'],
  ['SUN', 'BEAM'], ['MOON', 'LIGHT'], ['MOON', 'SHINE'], ['MOON', 'WALK'],
  ['STAR', 'FISH'], ['STAR', 'LIGHT'], ['STAR', 'DUST'], ['FIRE', 'FLY'],
  ['FIRE', 'WOOD'], ['FIRE', 'PLACE'], ['FIRE', 'WORK'], ['FIRE', 'FIGHTER'],
  ['FIRE', 'CRACKER'], ['FIRE', 'ARM'], ['FIRE', 'HOUSE'], ['FIRE', 'TRUCK'],
  ['EARTH', 'QUAKE'], ['EARTH', 'WORM'], ['THUNDER', 'STORM'], ['THUNDER', 'BOLT'],
  ['WIND', 'MILL'], ['WIND', 'SHIELD'], ['WIND', 'PIPE'], ['FOOT', 'BALL'],
  ['BASKET', 'BALL'], ['BASE', 'BALL'], ['FOOT', 'PATH'], ['FOOT', 'STEP'],
  ['FOOT', 'PRINT'], ['FOOT', 'NOTE'], ['FOOT', 'HILL'], ['HAND', 'BALL'],
  ['HAND', 'SHAKE'], ['HAND', 'WRITING'], ['HAND', 'BOOK'], ['HAND', 'CUFF'],
  ['HAND', 'MADE'], ['HAND', 'STAND'], ['HAND', 'BAG'], ['HAND', 'RAIL'],
  ['HAND', 'PRINT'], ['HAND', 'GUN'], ['HEAD', 'ACHE'], ['HEAD', 'LIGHT'],
  ['HEAD', 'LINE'], ['HEAD', 'PHONE'], ['HEAD', 'QUARTERS'], ['HEAD', 'BAND'],
  ['HEAD', 'ROOM'], ['HEAD', 'STONE'], ['HEAD', 'WAY'], ['HEAD', 'BOARD'],
  ['EYE', 'BALL'], ['EYE', 'BROW'], ['EYE', 'LASH'], ['EYE', 'LID'],
  ['EYE', 'SIGHT'], ['EYE', 'WITNESS'], ['EAR', 'RING'], ['EAR', 'DRUM'],
  ['EAR', 'PHONE'], ['EAR', 'ACHE'], ['NOSE', 'BLEED'], ['ARM', 'CHAIR'],
  ['ARM', 'PIT'], ['ARM', 'BAND'], ['LEG', 'ROOM'], ['THUMB', 'NAIL'],
  ['THUMB', 'TACK'], ['FINGER', 'PRINT'], ['FINGER', 'NAIL'], ['FINGER', 'TIP'],
  ['TOE', 'NAIL'], ['DRAGON', 'FLY'], ['LADY', 'BUG'], ['HORSE', 'SHOE'],
  ['HORSE', 'BACK'], ['HORSE', 'RADISH'], ['HORSE', 'FLY'], ['COW', 'BOY'],
  ['COW', 'HIDE'], ['PIG', 'PEN'], ['PIG', 'TAIL'], ['CAT', 'FISH'],
  ['CAT', 'NIP'], ['CAT', 'WALK'], ['DOG', 'HOUSE'], ['DOG', 'WOOD'],
  ['JELLY', 'FISH'], ['SWORD', 'FISH'], ['GOLD', 'FISH'], ['SHELL', 'FISH'],
  ['HUMMING', 'BIRD'], ['MOCKING', 'BIRD'], ['BLACK', 'BIRD'], ['BLUE', 'BIRD'],
  ['LOVE', 'BIRD'], ['SCARE', 'CROW'], ['TUMBLE', 'WEED'], ['SEA', 'HORSE'],
  ['SEA', 'SHELL'], ['SEA', 'WEED'], ['SEA', 'SICK'], ['SEA', 'SIDE'],
  ['SEA', 'FOOD'], ['SEA', 'SHORE'], ['SEA', 'PORT'], ['MOUNTAIN', 'SIDE'],
  ['HILL', 'SIDE'], ['HILL', 'TOP'], ['LAKE', 'SIDE'], ['RIVER', 'SIDE'],
  ['COUNTRY', 'SIDE'], ['OUT', 'SIDE'], ['IN', 'SIDE'], ['UP', 'SIDE'],
  ['UP', 'STAIRS'], ['DOWN', 'STAIRS'], ['UP', 'TOWN'], ['DOWN', 'TOWN'],
  ['UP', 'ROOT'], ['UP', 'GRADE'], ['UP', 'LIFT'], ['UP', 'RIGHT'],
  ['UP', 'SET'], ['UP', 'WARD'], ['UP', 'LOAD'], ['DOWN', 'FALL'],
  ['DOWN', 'POUR'], ['DOWN', 'STREAM'], ['DOWN', 'SIZE'], ['DOWN', 'LOAD'],
  ['OVER', 'COAT'], ['OVER', 'ALL'], ['OVER', 'BOARD'], ['OVER', 'FLOW'],
  ['OVER', 'HEAD'], ['OVER', 'LOAD'], ['OVER', 'LOOK'], ['OVER', 'NIGHT'],
  ['OVER', 'PASS'], ['OVER', 'SEAS'], ['OVER', 'SIGHT'], ['OVER', 'TIME'],
  ['OVER', 'TURN'], ['OVER', 'WEIGHT'], ['OVER', 'WORK'], ['UNDER', 'DOG'],
  ['UNDER', 'GROUND'], ['UNDER', 'LINE'], ['UNDER', 'MINE'], ['UNDER', 'PASS'],
  ['UNDER', 'STAND'], ['UNDER', 'TOW'], ['UNDER', 'WEAR'], ['UNDER', 'WORLD'],
  ['UNDER', 'ARM'], ['UNDER', 'COVER'], ['UNDER', 'HAND'], ['PAN', 'CAKE'], ['FRUIT', 'CAKE'],
  ['SHORT', 'CAKE'], ['CHEESE', 'CAKE'], ['CORN', 'BREAD'], ['GINGER', 'BREAD'],
  ['FLAT', 'BREAD'], ['POP', 'CORN'], ['ICE', 'CREAM'], ['ICE', 'BERG'],
  ['ICE', 'CUBE'], ['ICE', 'BOX'], ['ICE', 'SKATE'], ['ICE', 'BREAKER'],
  ['ICE', 'STORM'],
  ['PEA', 'NUT'], ['PEA', 'COCK'], ['DOUGH', 'NUT'], ['CHEST', 'NUT'],
  ['GRAPE', 'FRUIT'], ['GRAPE', 'VINE'], ['MILK', 'SHAKE'], ['MILK', 'WEED'],
  ['EGG', 'SHELL'], ['EGG', 'PLANT'], ['EGG', 'NOG'], ['OAT', 'MEAL'],
  ['CORN', 'MEAL'], ['DAY', 'LIGHT'], ['DAY', 'DREAM'], ['DAY', 'BREAK'],
  ['DAY', 'CARE'], ['DAY', 'TIME'], ['WEEK', 'END'], ['WEEK', 'DAY'],
  ['MID', 'NIGHT'], ['MID', 'DAY'], ['MID', 'TERM'], ['MID', 'WAY'],
  ['NIGHT', 'MARE'], ['NIGHT', 'GOWN'], ['NIGHT', 'FALL'], ['NIGHT', 'LIFE'],
  ['NIGHT', 'CLUB'], ['NIGHT', 'STAND'], ['NIGHT', 'TIME'], ['NIGHT', 'LIGHT'],
  ['AFTER', 'NOON'], ['AFTER', 'MATH'], ['AFTER', 'THOUGHT'], ['AFTER', 'WARD'],
  ['AFTER', 'LIFE'], ['AFTER', 'TASTE'], ['BIRTH', 'DAY'], ['BIRTH', 'PLACE'],
  ['BIRTH', 'MARK'], ['BIRTH', 'RIGHT'], ['BIRTH', 'STONE'], ['LIFE', 'TIME'],
  ['LIFE', 'GUARD'], ['LIFE', 'BOAT'], ['LIFE', 'STYLE'], ['LIFE', 'LINE'],
  ['LIFE', 'SPAN'], ['LIFE', 'LONG'], ['BED', 'ROOM'], ['BED', 'TIME'],
  ['BED', 'SPREAD'], ['BED', 'ROCK'], ['BED', 'SIDE'], ['BATH', 'ROOM'],
  ['BATH', 'ROBE'], ['BATH', 'TUB'], ['SWIM', 'SUIT'], ['SWIM', 'WEAR'],
  ['CLASS', 'ROOM'], ['CLASS', 'MATE'], ['BALL', 'ROOM'], ['REST', 'ROOM'],
  ['STORE', 'ROOM'], ['WORK', 'SHOP'], ['WORK', 'OUT'], ['WORK', 'FORCE'],
  ['WORK', 'LOAD'], ['WORK', 'PLACE'], ['WORK', 'BOOK'], ['WORK', 'BENCH'],
  ['WORK', 'HORSE'], ['HOME', 'WORK'], ['HOME', 'SICK'], ['HOME', 'TOWN'],
  ['HOME', 'LAND'], ['HOME', 'MADE'], ['HOME', 'STEAD'], ['HOME', 'ROOM'],
  ['HOME', 'PAGE'], ['NEWS', 'PAPER'], ['NEWS', 'STAND'], ['NEWS', 'CAST'],
  ['NEWS', 'ROOM'], ['NEWS', 'LETTER'], ['NEWS', 'FLASH'], ['SWEAT', 'SHIRT'],
  ['SWEAT', 'PANTS'], ['SWEAT', 'BAND'], ['WRIST', 'WATCH'], ['WRIST', 'BAND'],
  ['NECK', 'LACE'], ['NECK', 'TIE'], ['NECK', 'LINE'], ['HAIR', 'CUT'],
  ['HAIR', 'BRUSH'], ['HAIR', 'PIN'], ['HAIR', 'LINE'], ['HAIR', 'DO'],
  ['HAIR', 'STYLE'], ['HAIR', 'SPRAY'], ['TEXT', 'BOOK'], ['CHALK', 'BOARD'],
  ['BLACK', 'BOARD'], ['WHITE', 'BOARD'], ['SCORE', 'BOARD'], ['SURF', 'BOARD'],
  ['SKATE', 'BOARD'], ['CARD', 'BOARD'], ['DASH', 'BOARD'], ['SPRING', 'BOARD'],
  ['BOARD', 'ROOM'], ['BOARD', 'WALK'], ['BOARD', 'GAME'],
  ['WHITE', 'OUT'], ['WHITE', 'WATER'], ['WHITE', 'FISH'],
  ['CLIP', 'BOARD'], ['BILL', 'BOARD'], ['HEART', 'BEAT'], ['HEART', 'BREAK'],
  ['HEART', 'BURN'], ['HEART', 'ACHE'], ['STOMACH', 'ACHE'], ['SPACE', 'SHIP'],
  ['SPACE', 'SUIT'], ['SPACE', 'CRAFT'], ['SPACE', 'WALK'], ['AIR', 'PLANE'],
  ['AIR', 'PORT'], ['AIR', 'LINE'], ['AIR', 'WAY'], ['AIR', 'CRAFT'],
  ['AIR', 'BAG'], ['AIR', 'FIELD'], ['AIR', 'TIGHT'], ['AIR', 'FLOW'],
  ['SKY', 'LINE'], ['SKY', 'SCRAPER'], ['SKY', 'LIGHT'], ['SKY', 'DIVE'],
  ['CAR', 'POOL'], ['CAR', 'PORT'], ['HIGH', 'WAY'], ['FREE', 'WAY'],
  ['DRIVE', 'WAY'], ['RUN', 'WAY'], ['SUB', 'WAY'], ['GATE', 'WAY'],
  ['RAIL', 'ROAD'], ['RAIL', 'WAY'], ['ROAD', 'WAY'], ['ROAD', 'BLOCK'],
  ['ROAD', 'SIDE'], ['PARK', 'WAY'], ['PATH', 'WAY'], ['PLAY', 'GROUND'],
  ['PLAY', 'HOUSE'], ['PLAY', 'MATE'], ['PLAY', 'PEN'], ['PLAY', 'TIME'],
  ['PLAY', 'BOOK'], ['SAND', 'BOX'], ['SAND', 'CASTLE'], ['SAND', 'PAPER'],
  ['SAND', 'STORM'], ['WASTE', 'BASKET'], ['LIGHT', 'HOUSE'], ['LIGHT', 'BULB'],
  ['FLASH', 'LIGHT'], ['SPOT', 'LIGHT'], ['TAIL', 'LIGHT'], ['STREET', 'LIGHT'],
  ['CANDLE', 'LIGHT'], ['STREET', 'CAR'], ['FISH', 'HOOK'], ['FISH', 'BOWL'],
  ['GOLD', 'MINE'], ['GOLD', 'SMITH'], ['SILVER', 'WARE'], ['WOOD', 'PECKER'],
  ['WOOD', 'LAND'], ['WOOD', 'WORK'], ['WOOD', 'PILE'], ['WOOD', 'SHED'],
  ['DRIFT', 'WOOD'], ['STONE', 'WALL'], ['MILE', 'STONE'], ['LIME', 'STONE'],
  ['CORNER', 'STONE'], ['GEM', 'STONE'], ['GRAVE', 'STONE'], ['HAIL', 'STONE'],
  ['GRAVE', 'YARD'], ['COURT', 'YARD'], ['VINE', 'YARD'], ['JUNK', 'YARD'],
  ['BARN', 'YARD'], ['SHIP', 'YARD'], ['SHIP', 'WRECK'], ['FRIEND', 'SHIP'],

  // Second batch, added 2026-09-15.
  ['SCREW', 'DRIVER'], ['HAMMER', 'HEAD'], ['SAW', 'DUST'], ['NAIL', 'POLISH'],
  ['NAIL', 'FILE'], ['TOOL', 'BOX'], ['TOOL', 'KIT'], ['GLUE', 'STICK'],
  ['DUCT', 'TAPE'], ['TAPE', 'MEASURE'], ['DISH', 'WASHER'], ['DISH', 'CLOTH'],
  ['DISH', 'TOWEL'], ['POT', 'HOLDER'], ['STOVE', 'TOP'], ['COUNTER', 'TOP'],
  ['TABLE', 'CLOTH'], ['TABLE', 'SPOON'], ['TABLE', 'TOP'], ['PLACE', 'MAT'],
  ['PLACE', 'HOLDER'], ['FLAT', 'WARE'], ['GLASS', 'WARE'], ['POT', 'PIE'],
  ['CROCK', 'POT'], ['COFFEE', 'POT'], ['COFFEE', 'CAKE'], ['COFFEE', 'HOUSE'],
  ['DRUM', 'STICK'], ['DRUM', 'BEAT'], ['KEY', 'NOTE'], ['SONG', 'BOOK'],
  ['SONG', 'WRITER'], ['EAR', 'BUD'], ['MOUSE', 'PAD'], ['SCREEN', 'SHOT'],
  ['SCREEN', 'SAVER'], ['FIRE', 'WALL'], ['WEB', 'SITE'], ['WEB', 'PAGE'],
  ['KEY', 'PAD'], ['TOUCH', 'SCREEN'], ['TOUCH', 'DOWN'], ['FLASH', 'DRIVE'],
  ['SMART', 'PHONE'], ['VOICE', 'MAIL'], ['QUARTER', 'BACK'], ['GOAL', 'KEEPER'],
  ['GOAL', 'POST'], ['SIDE', 'LINE'], ['TIME', 'OUT'], ['HALF', 'TIME'],
  ['HALF', 'BACK'], ['FULL', 'BACK'], ['LINE', 'BACKER'], ['SOFT', 'BALL'],
  ['DODGE', 'BALL'], ['PIN', 'BALL'], ['RACQUET', 'BALL'], ['VOLLEY', 'BALL'],
  ['BOX', 'CAR'], ['MATCH', 'BOX'], ['SHOE', 'BOX'], ['LUNCH', 'BOX'],
  ['JUKE', 'BOX'], ['MAIL', 'BOX'], ['FARM', 'HOUSE'], ['FARM', 'LAND'],
  ['GREEN', 'HOUSE'], ['WARE', 'HOUSE'], ['COURT', 'HOUSE'], ['TREE', 'HOUSE'],
  ['DOLL', 'HOUSE'], ['CLUB', 'HOUSE'], ['BIRD', 'HOUSE'], ['POWER', 'HOUSE'],
  ['COURT', 'ROOM'], ['LIVING', 'ROOM'], ['DINING', 'ROOM'], ['GUEST', 'ROOM'],
  ['SHOW', 'ROOM'], ['GRASS', 'HOPPER'], ['SPIDER', 'WEB'], ['COB', 'WEB'],
  ['BEE', 'HIVE'], ['ANT', 'HILL'], ['FOX', 'HOLE'], ['RATTLE', 'SNAKE'],
  ['MOUSE', 'TRAP'], ['PAW', 'PRINT'], ['HAIL', 'STORM'], ['DUST', 'STORM'],
  ['WIND', 'STORM'], ['FIRE', 'STORM'], ['HEAT', 'WAVE'], ['FROST', 'BITE'],
  ['BROOM', 'STICK'], ['DUST', 'PAN'], ['CLOTHES', 'LINE'], ['CLOTHES', 'PIN'],
  ['PILLOW', 'CASE'], ['BED', 'SHEET'], ['NEW', 'YEAR'], ['YEAR', 'BOOK'],
  ['TOP', 'HAT'], ['HARD', 'HAT'], ['NIGHT', 'CAP'], ['FOOT', 'WEAR'],
  ['SLEEP', 'WALK'], ['SLEEP', 'OVER'], ['KNEE', 'CAP'], ['CHEEK', 'BONE'],
  ['JAW', 'BONE'], ['WISH', 'BONE'], ['COLLAR', 'BONE'], ['BELLY', 'BUTTON'],
  ['BELLY', 'ACHE'], ['POST', 'CARD'], ['POST', 'MARK'], ['FLASH', 'CARD'],
  ['SCORE', 'CARD'], ['REPORT', 'CARD'], ['WILD', 'CARD'], ['WILD', 'LIFE'],
  ['WILD', 'FIRE'], ['WILD', 'FLOWER'], ['SKETCH', 'BOOK'], ['SCRAP', 'BOOK'],
  ['PICTURE', 'BOOK'], ['STORY', 'BOOK'], ['COMIC', 'BOOK'], ['PHONE', 'BOOK'],
  ['COOK', 'BOOK'], ['COOK', 'OUT'], ['BREAK', 'FAST'], ['FAST', 'FOOD'],
  ['JUNK', 'FOOD'], ['CAT', 'FOOD'], ['DOG', 'FOOD'], ['BIRD', 'SEED'],
  ['BIRD', 'BATH'], ['BIRD', 'CAGE'], ['HOT', 'DOG'], ['HOT', 'SPOT'],
  ['HOT', 'SHOT'], ['HOT', 'CAKE'], ['FLOWER', 'POT'], ['FLOWER', 'BED'],
  ['STRAW', 'BERRY'], ['BLUE', 'BERRY'], ['BLACK', 'BERRY'], ['GOOSE', 'BERRY'],
  ['BLUE', 'BELL'], ['BLUE', 'PRINT'], ['BLUE', 'MOON'], ['BLACK', 'SMITH'], ['BLACK', 'OUT'],
  ['BLACK', 'LIST'], ['BLACK', 'MAIL'], ['WHITE', 'WASH'],

  // Third batch, added 2026-09-16 — a deliberate sweep, not one-off patches.
  // BACK+ROOM and BOARD+ROOM both failed because a prolific word had only
  // ever been entered as the SECOND half of a pair, never the first. Ran
  // every word that's currently second-only through a real check for
  // "is this also a common first-half in English" instead of waiting for
  // more of these to get reported one at a time.
  ['ROOM', 'MATE'], ['GAME', 'SHOW'], ['HOUSE', 'HOLD'], ['HOUSE', 'WORK'],
  ['HOUSE', 'BOAT'], ['BOAT', 'HOUSE'], ['GUARD', 'RAIL'], ['LAND', 'MARK'],
  ['LAND', 'SCAPE'], ['LAND', 'FILL'], ['DREAM', 'LAND'], ['GROUND', 'WORK'],
  ['GROUND', 'HOG'], ['WATCH', 'DOG'], ['WATCH', 'TOWER'], ['WAY', 'SIDE'],
  ['BAND', 'WAGON'], ['BAND', 'STAND'], ['CAP', 'STONE'], ['CUT', 'BACK'],
  ['DROP', 'OUT'], ['DROP', 'BOX'], ['FALL', 'OUT'], ['FLY', 'OVER'],
  ['FLY', 'WHEEL'], ['GUN', 'SHOT'], ['MAN', 'HOLE'], ['MINE', 'FIELD'],
  ['MINE', 'SWEEPER'], ['NUT', 'CRACKER'], ['NUT', 'SHELL'], ['PACK', 'HORSE'],
  ['PIT', 'FALL'], ['PIT', 'STOP'], ['PROOF', 'READ'], ['SEAT', 'BELT'],
  ['SET', 'BACK'], ['SET', 'UP'], ['SHOP', 'KEEPER'], ['SHOP', 'LIFT'],
  ['SHOT', 'GUN'], ['STAND', 'POINT'], ['STEP', 'LADDER'], ['STOP', 'WATCH'],
  ['STOP', 'LIGHT'], ['TIE', 'BREAKER'], ['TIP', 'TOE'], ['TOWN', 'HOUSE'],
  ['TRAP', 'DOOR'], ['WASH', 'ROOM'], ['WASH', 'TUB'], ['WASH', 'OUT'],
  ['WORLD', 'WIDE'], ['YARD', 'STICK'], ['CARE', 'TAKER'], ['END', 'POINT'],
  ['END', 'GAME'], ['FIELD', 'WORK'], ['FIELD', 'TRIP'], ['FLOW', 'CHART'],
  ['FORCE', 'FIELD'], ['HIDE', 'OUT'], ['HIDE', 'AWAY'], ['CHECK', 'MATE'],
  ['PAD', 'LOCK'], ['PASS', 'WORD'], ['PASS', 'PORT'], ['PICK', 'POCKET'],
  ['PICK', 'UP'], ['PIPE', 'LINE'], ['POOL', 'SIDE'], ['PRINT', 'OUT'],
  ['RING', 'TONE'], ['RING', 'WORM'], ['ROCK', 'SLIDE'], ['ROCK', 'STAR'],
  ['SHELF', 'LIFE'], ['SICK', 'BAY'], ['SITE', 'MAP'], ['SLIDE', 'SHOW'],
  ['SPOON', 'FEED'], ['SPRAY', 'PAINT'], ['STICK', 'UP'], ['STICK', 'BALL'],
  ['SUIT', 'CASE'], ['SWING', 'SET'], ['TRUCK', 'LOAD'], ['TURN', 'OVER'],
  ['TURN', 'TABLE'], ['WAVE', 'LENGTH'], ['WORM', 'HOLE'],

  // 2026-09-17 — user asked for a full audit of every BACK pair. All 32
  // existing ones checked out as real (backpack, backfire, backswing,
  // backorder, etc, verified one at a time, none removed). Found more
  // real BACK+ compounds while at it, same shape as the BOARD/WHITE sweep.
  ['BACK', 'BOARD'], ['BACK', 'BITE'], ['BACK', 'COURT'], ['BACK', 'FILL'],
  ['BACK', 'FLIP'], ['BACK', 'HOE'], ['BACK', 'LIT'], ['BACK', 'REST'],
  ['BACK', 'SAW'], ['BACK', 'STAB'], ['BACK', 'STORY'], ['BACK', 'STREET'],
  ['BACK', 'WATER'], ['BACK', 'WASH'], ['BACK', 'LIGHT'], ['BACK', 'DRAFT'],
  ['BACK', 'STITCH'], ['BACK', 'STRETCH'],

  // 2026-09-17 — broader sweep at the user's request, not a one-off patch.
  // Pulled every word that's currently second-only (192 of them) and read
  // through the whole list for real first-half compounds, same method as
  // the earlier 224-word pass, just applied to the bank as it stands now.
  ['FIELD', 'HOUSE'], ['BAG', 'PIPE'], ['BEAT', 'BOX'], ['BELL', 'HOP'],
  ['BELL', 'BOY'], ['BELT', 'WAY'], ['BENCH', 'MARK'], ['BITE', 'SIZE'],
  ['BLOCK', 'BUSTER'], ['BLOCK', 'HEAD'], ['BONE', 'HEAD'], ['BOW', 'TIE'],
  ['BOY', 'FRIEND'], ['BOY', 'HOOD'], ['BREAD', 'BOX'], ['BREAD', 'WINNER'],
  ['BROW', 'BEAT'], ['BRUSH', 'FIRE'], ['BURN', 'OUT'], ['BUTTON', 'HOLE'],
  ['CAKE', 'WALK'], ['CASE', 'WORK'], ['CASE', 'LOAD'], ['CAST', 'AWAY'],
  ['CAST', 'OFF'], ['CHAIN', 'SAW'], ['CHAIN', 'LINK'], ['CHAIR', 'LIFT'],
  ['COAT', 'TAIL'], ['COMB', 'OVER'], ['COVER', 'UP'], ['COVER', 'ALL'],
  ['CROW', 'BAR'], ['CUFF', 'LINK'], ['DIVE', 'BOMB'], ['FEED', 'BACK'],
  ['FLIP', 'BOOK'], ['FLIP', 'SIDE'], ['FOOD', 'COURT'], ['HAT', 'TRICK'],
  ['HIVE', 'MIND'], ['HOG', 'WASH'], ['HOLD', 'UP'], ['HOLD', 'OUT'],
  ['LETTER', 'HEAD'], ['LETTER', 'BOX'], ['LIFT', 'OFF'], ['LOCK', 'DOWN'],
  ['LOCK', 'SMITH'], ['LOCK', 'OUT'], ['LOCK', 'UP'], ['LOG', 'JAM'],
  ['LOG', 'BOOK'], ['LONG', 'HAND'], ['LONG', 'SHOT'], ['LOOK', 'OUT'],
  ['MARK', 'DOWN'], ['MARK', 'UP'], ['MEAL', 'TIME'], ['MILL', 'STONE'],
  ['PAPER', 'BACK'], ['PAPER', 'WORK'], ['PAPER', 'CLIP'], ['PEN', 'PAL'],
  ['PEN', 'KNIFE'], ['PILE', 'UP'], ['POCKET', 'BOOK'], ['POCKET', 'KNIFE'],
  ['POINT', 'BLANK'], ['POINT', 'GUARD'], ['PORT', 'HOLE'], ['READ', 'OUT'],
  ['ROOT', 'BEER'], ['SEED', 'BED'], ['SHAKE', 'DOWN'], ['SHORE', 'LINE'],
  ['SIZE', 'UP'], ['SNAKE', 'BITE'], ['SNAKE', 'SKIN'], ['SPIN', 'OFF'],
  ['STAGE', 'COACH'], ['STREAM', 'LINE'], ['TALK', 'BACK'], ['TALK', 'SHOW'],
  ['TONE', 'DEAF'], ['TOW', 'TRUCK'], ['TRIP', 'WIRE'], ['WALK', 'OUT'],
  ['WALK', 'WAY'], ['WEIGHT', 'LOSS'], ['WHEEL', 'HOUSE'], ['WHEEL', 'BARROW'],
  ['WORD', 'PLAY'],
];

// Deterministic string -> uint32 seed (same string always yields same seed,
// same convention as the rest of the suite keying daily puzzles off a date
// string like getTodayKey()'s en-CA/America-New_York output). Exported so
// useGameState can seed its own board-layout shuffle off the same dateKey
// without duplicating this logic.
export function seedFromString(str) {
  let seed = 0;
  for (let i = 0; i < str.length; i++) {
    seed = (seed * 31 + str.charCodeAt(i)) >>> 0;
  }
  return seed;
}

// mulberry32 - small, fast, deterministic PRNG. Good enough for shuffling a
// word list; not cryptographic, doesn't need to be. Exported for the same
// reason as seedFromString above.
export function mulberry32(seed) {
  return function next() {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Subset of WORD_BANK entries most players recognize on sight (short,
// everyday compounds). The board deals its OPENING pairs complete and
// findable no matter what (see buildInitialBoard in useGameState.js) — so
// initial difficulty was never about missing partners, it was about
// scanning 16 unfamiliar words cold. Biasing which pairs land in those
// opening slots toward this list is the actual lever. Every entry here is
// copied verbatim from WORD_BANK above, not new content.
const EASY_PAIRS = [
  ['PAINT', 'BRUSH'], ['KEY', 'BOARD'], ['DOOR', 'BELL'], ['BOOK', 'SHELF'],
  ['BACK', 'PACK'], ['CUP', 'CAKE'], ['BUTTER', 'FLY'], ['RAIN', 'BOW'],
  ['SNOW', 'MAN'], ['SUN', 'FLOWER'], ['MOON', 'LIGHT'], ['STAR', 'FISH'],
  ['FIRE', 'FLY'], ['FOOT', 'BALL'], ['HAND', 'SHAKE'], ['EYE', 'BALL'],
  ['ARM', 'CHAIR'], ['HORSE', 'SHOE'], ['LADY', 'BUG'], ['DOG', 'HOUSE'],
  ['SEA', 'SHELL'], ['UP', 'STAIRS'], ['DOWN', 'TOWN'], ['ICE', 'CREAM'],
  ['PAN', 'CAKE'], ['POP', 'CORN'], ['DAY', 'DREAM'], ['NIGHT', 'MARE'],
  ['BIRTH', 'DAY'], ['BED', 'ROOM'], ['BATH', 'ROOM'], ['HAIR', 'CUT'],
  ['NEWS', 'PAPER'], ['AIR', 'PLANE'], ['SKY', 'LINE'], ['RAIL', 'ROAD'],
  ['PLAY', 'GROUND'], ['SAND', 'BOX'], ['LIGHT', 'HOUSE'], ['FISH', 'BOWL'],
];

// How many of the board's 8 opening pairs to pull from EASY_PAIRS before
// falling back to the full bank for the rest (and for every later refill).
const EASY_OPENING_COUNT = 8;

// Deterministically picks that day's pair pool from WORD_BANK, keyed by
// dateKey (pass the same date-key string every other NoodleGame uses for
// EPOCH/puzzle-numbering, so the same day always gets the same pool for
// every player). Enforces the one rule that actually matters for
// playability: no word appears in more than one selected pair, so the board
// never ends up with an ambiguous or orphaned word. The first
// EASY_OPENING_COUNT pairs returned are drawn from EASY_PAIRS (still
// shuffled per day) so the opening board is easier to parse; everything
// after that — including every refill mid-run — draws from the full bank
// same as before, so the difficulty ramp already tuned in refill.js is
// untouched.
export function selectDailyPool(dateKey, count = 28) {
  const rng = mulberry32(seedFromString(dateKey));
  const usedWords = new Set();
  const pool = [];

  const shuffledEasy = [...EASY_PAIRS];
  for (let i = shuffledEasy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledEasy[i], shuffledEasy[j]] = [shuffledEasy[j], shuffledEasy[i]];
  }
  for (const pair of shuffledEasy) {
    if (pool.length >= EASY_OPENING_COUNT) break;
    const [first, second] = pair;
    if (usedWords.has(first) || usedWords.has(second)) continue;
    usedWords.add(first);
    usedWords.add(second);
    pool.push(pair);
  }

  const shuffled = [...WORD_BANK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (const pair of shuffled) {
    if (pool.length >= count) break;
    const [first, second] = pair;
    if (usedWords.has(first) || usedWords.has(second)) continue;
    usedWords.add(first);
    usedWords.add(second);
    pool.push(pair);
  }
  return pool;
}
