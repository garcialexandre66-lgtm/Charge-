<script>
"use strict";
/* ================= data ================= */
const APPV='6.2';
const $=s=>document.querySelector(s);
/* rough recovery window in hours per muscle: an app heuristic (large ≈72 h, medium ≈48 h, small ≈36 h), not a measurement */
const MUS={quadriceps:72,ischios:72,fessiers:72,dorsaux:72,pectoraux:72,lombaires:72,épaules:48,trapèzes:48,biceps:48,triceps:48,adducteurs:48,mollets:36,abdos:36,obliques:36,'avant-bras':36};
const KINDS={machine:'Machine',barre:'Barre',halt:'Haltères',poulie:'Poulie',pdc:'Poids du corps'};
/* muscle families used for colour: push (chest, shoulders, triceps), pull (back, biceps, forearms, traps), legs, glutes, core */
const GRP={pectoraux:'push',épaules:'push',triceps:'push',dorsaux:'pull',biceps:'pull','avant-bras':'pull',trapèzes:'pull',quadriceps:'legs',ischios:'legs',adducteurs:'legs',mollets:'legs',fessiers:'glute',abdos:'core',obliques:'core',lombaires:'core'};
const GRPN={push:'Poussée',pull:'Tirage',legs:'Jambes',glute:'Fessiers',core:'Gainage'};
const grpOfM=m=>GRP[m]||'core';
const grp=id=>grpOfM(exo(id).m[0]);
/* exercise library: id, name, muscles (first = main), kind, compound, cues */
const LIB=[
 /* pectoraux */
 ['couche','Développé couché barre',['pectoraux','triceps','épaules'],'barre',1,['Omoplates serrées, pieds bien à plat','Descends la barre au bas des pectoraux','Coudes à 45° du corps, pas à 90°']],
 ['couchedb','Développé couché haltères',['pectoraux','triceps','épaules'],'halt',1,['Haltères au-dessus des épaules en haut','Descends jusqu’à sentir l’étirement des pecs','Pousse en rapprochant légèrement les haltères']],
 ['incline_b','Développé incliné barre',['pectoraux','épaules','triceps'],'barre',1,['Banc à 30–45°','Barre vers le haut des pectoraux','Garde le bas du dos au contact du banc']],
 ['incline','Développé incliné haltères',['pectoraux','épaules','triceps'],'halt',1,['Banc à 30–45°','Coudes sous les poignets','Expire en poussant']],
 ['decline','Développé décliné',['pectoraux','triceps'],'barre',1,['Pieds bloqués sous les rouleaux','Barre vers le bas des pectoraux','Amplitude contrôlée']],
 ['smithbench','Développé couché à la Smith',['pectoraux','triceps','épaules'],'machine',1,['Règle le banc pour que la barre arrive au bas des pecs','Verrouille les crochets en fin de série','Trajectoire fixe : idéal pour charger lourd seul']],
 ['chestpress','Chest press',['pectoraux','triceps','épaules'],'machine',1,['Poignées à hauteur du milieu de la poitrine','Dos et tête collés au dossier','Ne verrouille pas les coudes en fin de poussée']],
 ['chestinc','Chest press incliné',['pectoraux','épaules','triceps'],'machine',1,['Siège réglé : poignées au haut des pecs','Pousse vers le haut et l’avant','Reviens lentement, sans laisser tomber']],
 ['pecdeck','Pec deck',['pectoraux','épaules'],'machine',0,['Coudes à hauteur d’épaules','Ferme les bras en serrant les pecs','Ouvre lentement, sans forcer l’épaule']],
 ['ecarte','Écarté couché haltères',['pectoraux','épaules'],'halt',0,['Coudes légèrement fléchis, toujours','Ouvre jusqu’à l’étirement, pas plus','Remonte comme si tu enlaçais un arbre']],
 ['crossover','Écarté poulie vis-à-vis',['pectoraux'],'poulie',0,['Poulies hautes, buste légèrement penché','Ramène les mains devant le bassin','Contrôle le retour, coudes souples']],
 ['pompes','Pompes',['pectoraux','triceps','épaules'],'pdc',1,['Corps gainé, de la tête aux pieds','Mains un peu plus larges que les épaules','Poitrine près du sol à chaque répétition']],
 ['dips','Dips',['pectoraux','triceps','épaules'],'pdc',1,['Buste penché vers l’avant pour les pecs','Descends jusqu’à coudes à 90°','Lest à la ceinture quand c’est facile']],
 ['pulloverdb','Pull-over haltère',['pectoraux','dorsaux'],'halt',0,['Haltère tenu à deux mains au-dessus de la poitrine','Descends derrière la tête bras presque tendus','Remonte en contractant pecs et dorsaux']],
 /* dos */
 ['tractions','Tractions pronation',['dorsaux','biceps'],'pdc',1,['Prise plus large que les épaules','Monte le menton au-dessus de la barre','Descends bras tendus, sans balancer']],
 ['chinup','Tractions supination',['dorsaux','biceps'],'pdc',1,['Paumes vers toi, prise serrée','Tire les coudes vers les hanches','Plus de biceps que les tractions pronation']],
 ['tirage','Tirage vertical',['dorsaux','biceps'],'poulie',1,['Cuisses bloquées sous les boudins','Tire la barre vers le haut de la poitrine','Poitrine sortie, ne te balance pas en arrière : tire les coudes vers les hanches']],
 ['tirageserre','Tirage vertical prise serrée',['dorsaux','biceps'],'poulie',1,['Poignée triangle ou prise neutre','Coudes qui descendent le long du corps','Serre les omoplates en bas']],
 ['rowing','Rowing assis machine',['dorsaux','trapèzes','biceps'],'machine',1,['Poitrine contre le support','Tire les coudes vers l’arrière','Serre les omoplates une seconde']],
 ['rowpoulie','Rowing assis poulie',['dorsaux','trapèzes','biceps'],'poulie',1,['Genoux légèrement fléchis','Tire vers le nombril, dos droit','Ne te balance pas d’avant en arrière']],
 ['rowbarre','Rowing barre',['dorsaux','trapèzes','lombaires'],'barre',1,['Buste penché à 45°, dos plat','Barre vers le nombril','Gaine fort : le bas du dos travaille aussi']],
 ['rowdb','Rowing haltère un bras',['dorsaux','biceps'],'halt',1,['Main et genou en appui sur le banc','Tire l’haltère vers la hanche','Dos plat, ne tourne pas le buste']],
 ['tbar','Rowing T-bar',['dorsaux','trapèzes'],'barre',1,['Barre calée dans un coin ou machine T-bar','Dos plat, poitrine sortie','Tire vers le bas des pecs']],
 ['pullover','Tirage bras tendus poulie',['dorsaux'],'poulie',0,['Bras presque tendus tout du long','Ramène la barre vers les cuisses','Isole le dos sans les biceps']],
 ['souleve','Soulevé de terre',['lombaires','ischios','fessiers','dorsaux'],'barre',1,['Barre au-dessus du milieu du pied','Dos plat, poitrine sortie avant de tirer','Pousse le sol avec les jambes, la barre frôle les tibias']],
 ['shrug','Shrugs haltères',['trapèzes'],'halt',0,['Bras tendus le long du corps','Monte les épaules vers les oreilles','Tiens une seconde, sans rouler les épaules']],
 ['shrugb','Shrugs barre',['trapèzes'],'barre',0,['Barre devant les cuisses','Haussement vertical uniquement','Charge lourde, amplitude courte']],
 ['facepull','Face pull',['épaules','trapèzes'],'poulie',0,['Corde à hauteur du visage','Tire vers le front en écartant les mains','Coudes hauts : excellent pour les épaules']],
 ['lombaires','Extension lombaires',['lombaires','fessiers','ischios'],'machine',0,['Bassin calé sur le boudin','Descends dos plat','Remonte jusqu’à l’alignement, pas au-delà']],
 ['goodmorning','Good morning',['ischios','lombaires','fessiers'],'barre',1,['Barre sur le haut du dos','Pousse les fesses en arrière, genoux souples','Dos plat jusqu’à sentir les ischios']],
 ['inverserow','Rowing inversé',['dorsaux','biceps','trapèzes'],'pdc',1,['Corps gainé sous une barre','Tire la poitrine vers la barre','Plus les pieds sont loin, plus c’est dur']],
 /* épaules */
 ['militaire','Développé militaire barre',['épaules','triceps'],'barre',1,['Debout, fessiers et abdos serrés','Barre qui passe près du visage','Tête qui avance sous la barre en haut']],
 ['epaulesdb','Développé épaules haltères',['épaules','triceps'],'halt',1,['Assis, dos contre le dossier','Coudes un peu en avant du corps','Ne cogne pas les haltères en haut']],
 ['epaules','Développé épaules machine',['épaules','triceps'],'machine',1,['Poignées à hauteur des épaules au départ','Pousse vers le haut sans cambrer','Reviens jusqu’aux oreilles']],
 ['arnold','Arnold press',['épaules','triceps'],'halt',1,['Départ paumes vers toi, coudes devant','Tourne les poignets en poussant','Termine paumes vers l’avant']],
 ['elev','Élévations latérales haltères',['épaules'],'halt',0,['Coudes légèrement fléchis','Monte jusqu’à l’horizontale, pas plus','Charge légère, mouvement lent']],
 ['elevpoulie','Élévations latérales poulie',['épaules'],'poulie',0,['Poulie basse, côté opposé','Un bras à la fois','Tension constante grâce au câble']],
 ['elevmachine','Élévations latérales machine',['épaules'],'machine',0,['Épaules alignées avec l’axe de la machine','Pousse avec les coudes, pas les mains','Pause en haut']],
 ['frontale','Élévations frontales',['épaules'],'halt',0,['Bras presque tendus','Monte devant toi jusqu’aux yeux','Pas d’élan avec le dos']],
 ['oiseaudb','Oiseau haltères',['épaules','trapèzes'],'halt',0,['Buste penché, dos plat','Ouvre les bras sur les côtés','Arrière d’épaule : charge légère']],
 ['oiseau','Oiseau à la machine',['épaules','trapèzes'],'machine',0,['Face au dossier du pec deck','Bras presque tendus, ouvre vers l’arrière','Serre les omoplates à la fin']],
 ['uprow','Rowing menton',['épaules','trapèzes'],'barre',0,['Prise largeur d’épaules','Monte les coudes au-dessus des mains','Arrête à hauteur de poitrine si l’épaule gêne']],
 /* biceps */
 ['curlb','Curl barre',['biceps','avant-bras'],'barre',0,['Coudes collés au corps','Monte sans balancer le buste','Descends jusqu’aux bras tendus']],
 ['curlh','Curl haltères',['biceps','avant-bras'],'halt',0,['Tourne la paume vers le haut en montant','Un bras ou les deux en même temps','Contrôle la descente']],
 ['marteau','Curl marteau',['biceps','avant-bras'],'halt',0,['Pouces vers le haut tout du long','Coudes fixes','Travaille aussi l’avant-bras']],
 ['curl','Curl pupitre',['biceps','avant-bras'],'machine',0,['Aisselles calées en haut du pupitre','Ne décolle pas les coudes','Descente lente, bras presque tendus']],
 ['curlinc','Curl incliné haltères',['biceps'],'halt',0,['Banc à 45°, bras pendants','Étirement maximal du biceps','Coudes qui restent en arrière']],
 ['curlpoulie','Curl poulie',['biceps','avant-bras'],'poulie',0,['Poulie basse, barre droite ou EZ','Tension continue','Coudes fixes le long du corps']],
 ['curlconc','Curl concentré',['biceps'],'halt',0,['Coude calé contre l’intérieur de la cuisse','Monte vers l’épaule opposée','Serre une seconde en haut']],
 /* triceps */
 ['triceps','Extension triceps poulie',['triceps'],'poulie',0,['Coudes collés au corps','Pousse jusqu’aux bras tendus','Seuls les avant-bras bougent']],
 ['tricorde','Extension triceps corde',['triceps'],'poulie',0,['Écarte la corde en bas du mouvement','Coudes fixes','Remonte jusqu’à l’angle droit']],
 ['barrefront','Barre au front',['triceps'],'barre',0,['Allongé, bras verticaux','Descends la barre vers le front','Coudes qui ne s’écartent pas']],
 ['extnuque','Extension nuque haltère',['triceps'],'halt',0,['Haltère tenu à deux mains au-dessus de la tête','Descends derrière la nuque','Coudes pointés vers le plafond']],
 ['dipsbanc','Dips sur banc',['triceps','pectoraux'],'pdc',1,['Mains au bord du banc derrière toi','Descends jusqu’à coudes à 90°','Dos près du banc']],
 ['kickback','Kickback haltère',['triceps'],'halt',0,['Buste penché, bras collé au corps','Tends le bras vers l’arrière','Charge légère, contraction en haut']],
 ['couchesserre','Développé couché prise serrée',['triceps','pectoraux','épaules'],'barre',1,['Mains largeur d’épaules','Coudes le long du corps','Barre vers le bas des pecs']],
 ['tricmachine','Extension triceps machine',['triceps'],'machine',0,['Coudes calés sur le support','Pousse jusqu’aux bras tendus','Retour lent']],
 /* avant-bras */
 ['curlpoignet','Curl poignets',['avant-bras'],'barre',0,['Avant-bras posés sur les cuisses','Seuls les poignets bougent','Séries longues, 15 à 20 reps']],
 ['farmer','Marche du fermier',['avant-bras','trapèzes','abdos'],'halt',1,['Haltères lourds, bras tendus','Marche à petits pas, buste droit','Note la distance parcourue, en mètres']],
 /* jambes */
 ['squat','Squat barre',['quadriceps','fessiers','lombaires'],'barre',1,['Barre sur le haut du dos, pieds largeur d’épaules','Descends hanches en arrière, genoux vers l’extérieur','Cuisses au moins parallèles au sol']],
 ['frontsquat','Squat avant',['quadriceps','fessiers'],'barre',1,['Barre sur l’avant des épaules, coudes hauts','Buste très droit','Plus de quadriceps que le squat classique']],
 ['goblet','Goblet squat',['quadriceps','fessiers'],'halt',1,['Haltère tenu contre la poitrine','Coudes entre les genoux en bas','Parfait pour apprendre le squat']],
 ['smithsquat','Squat à la Smith',['quadriceps','fessiers'],'machine',1,['Pieds un peu en avant de la barre','Descends jusqu’aux cuisses parallèles','Trajectoire guidée : charge en sécurité']],
 ['hack','Hack squat',['quadriceps','fessiers'],'machine',1,['Dos et épaules contre les appuis','Pieds au milieu de la plateforme','Descends profond, sans décoller les talons']],
 ['presse','Presse à cuisses',['quadriceps','fessiers'],'machine',1,['Pieds largeur de hanches au milieu du plateau','Descends jusqu’à 90° aux genoux','Ne verrouille pas les genoux en haut']],
 ['legext','Leg extension',['quadriceps'],'machine',0,['Genou aligné avec l’axe de la machine','Rouleau sur le bas du tibia','Monte, tiens une seconde, redescends lentement']],
 ['fentes','Fentes haltères',['quadriceps','fessiers'],'halt',1,['Grand pas en avant','Genou arrière près du sol','Pousse sur le talon avant pour remonter']],
 ['fentesmarche','Fentes marchées',['quadriceps','fessiers'],'halt',1,['Avance d’une jambe à l’autre','Buste droit','Compte les répétitions par jambe']],
 ['bulgare','Fentes bulgares',['quadriceps','fessiers'],'halt',1,['Pied arrière posé sur un banc','Descends à la verticale','Une jambe à la fois : redoutable']],
 ['stepup','Step-up',['quadriceps','fessiers'],'halt',1,['Box à hauteur de genou','Monte en poussant sur la jambe du haut','Ne t’aide pas avec le pied du bas']],
 ['legcurl','Leg curl assis',['ischios'],'machine',0,['Genou aligné avec l’axe','Cuisses bloquées par le boudin','Ramène les talons sous le siège']],
 ['legcurlallonge','Leg curl allongé',['ischios'],'machine',0,['Allongé sur le ventre, hanches plaquées','Ramène les talons vers les fesses','Descente lente']],
 ['sdtr','Soulevé de terre roumain',['ischios','fessiers','lombaires'],'barre',1,['Genoux légèrement fléchis et fixes','Fesses en arrière, barre le long des cuisses','Descends jusqu’à l’étirement des ischios']],
 ['sdtrdb','Soulevé de terre roumain haltères',['ischios','fessiers','lombaires'],'halt',1,['Haltères devant les cuisses, genoux légèrement fléchis','Fesses en arrière, haltères le long des jambes','Descends jusqu’à l’étirement des ischios, dos plat']],
 ['nordic','Nordic curl',['ischios'],'pdc',0,['Chevilles bloquées, à genoux','Descends le plus lentement possible','Rattrape-toi avec les mains en bas']],
 ['hipthrust','Hip thrust',['fessiers','ischios'],'barre',1,['Haut du dos sur le banc, barre sur les hanches','Monte jusqu’à l’alignement épaules-genoux','Serre les fessiers une seconde en haut']],
 ['pont','Pont fessier',['fessiers','ischios'],'pdc',0,['Allongé, pieds près des fesses','Monte le bassin en poussant sur les talons','Ajoute un disque sur les hanches pour progresser']],
 ['abduction','Abduction machine',['fessiers'],'machine',0,['Dos contre le dossier','Écarte les genoux, retour contrôlé','Penche-toi en avant pour plus de fessiers']],
 ['adduction','Adduction machine',['adducteurs'],'machine',0,['Rapproche les genoux','Retour lent jusqu’à l’étirement','Amplitude confortable']],
 ['kickpoulie','Kickback fessier poulie',['fessiers','ischios'],'poulie',0,['Sangle à la cheville, poulie basse','Pousse la jambe vers l’arrière','Bassin fixe, ne cambre pas']],
 ['mollets','Mollets debout',['mollets'],'machine',0,['Avant du pied sur la marche','Descends le talon au maximum','Monte sur la pointe, tiens une seconde']],
 ['molletsassis','Mollets assis',['mollets'],'machine',0,['Boudin sur le bas des cuisses','Amplitude complète','Cible le soléaire, sous le mollet']],
 ['molletspresse','Mollets à la presse',['mollets'],'machine',0,['Pointes de pieds en bas du plateau','Jambes tendues mais pas verrouillées','Pousse avec les orteils']],
 /* abdos */
 ['crunch','Crunch machine',['abdos','obliques'],'machine',0,['Enroule le buste, ne tire pas avec les bras','Expire en descendant','Mouvement court et contrôlé']],
 ['crunchsol','Crunch au sol',['abdos'],'pdc',0,['Allongé, genoux fléchis','Décolle les épaules, menton rentré','Expire en montant']],
 ['crunchpoulie','Crunch poulie à genoux',['abdos','obliques'],'poulie',0,['À genoux, corde derrière la tête','Enroule le buste vers les cuisses','Les hanches ne bougent pas']],
 ['releve','Relevés de jambes suspendu',['abdos'],'pdc',0,['Suspendu à la barre, sans balancer','Monte les jambes à l’horizontale','Genoux pliés pour faciliter']],
 ['relevegenoux','Relevés de genoux chaise romaine',['abdos'],'pdc',0,['Avant-bras sur les appuis, dos collé','Monte les genoux vers la poitrine','Enroule le bassin en haut']],
 ['gainage','Gainage (planche)',['abdos','obliques'],'pdc',0,['Sur les avant-bras, corps aligné','Serre fessiers et abdos','Note le temps tenu, en secondes']],
 ['russian','Russian twist',['obliques','abdos'],'pdc',0,['Assis, buste incliné en arrière','Tourne les épaules d’un côté à l’autre','Pieds au sol ou décollés pour plus dur']],
 ['roue','Roue abdominale',['abdos'],'pdc',0,['À genoux, roue sous les épaules','Avance en gardant le dos rond','Reviens en contractant les abdos']],
 ['woodchop','Rotation poulie (bûcheron)',['obliques','abdos'],'poulie',0,['Poulie haute, de côté','Tire en diagonale vers la hanche opposée','La rotation vient du buste, bras tendus']]
].map(([id,n,m,k,c,q])=>({id,n,m,k,c,q,seat:''}));
/* how a set is measured. unit: reps | s (seconds) | m (metres). lt: load (kg lifted) | bw (body weight + added load) | assist (assistance kg, less = harder).
   Each set keeps its own measure (l.lt, l.un) so changing an exercise later never rewrites the history. */
const UNITS={gainage:'s',farmer:'m'};
const UL={reps:['rép.','Répétitions'],s:['s','Secondes'],m:['m','Mètres']};
const LTL={load:'Charge',bw:'Poids du corps + lest',assist:'Assistance'};
const LTIN={load:'Charge',bw:'Lest ajouté',assist:'Assistance'};
const it=(id,s,a,b,rest)=>({id,s,rmin:a,rmax:b??a,...(rest?{rest}:{})});
const TPL={
 fb:{n:'Full body',lvl:'Débutant',sess:3,info:'3 séances par semaine, 45 à 60 min',progs:[
  {n:'Full body A',items:[it('presse',3,8,12),it('couche',3,6,10),it('tirage',3,8,12),it('epaules',3,8,12),it('crunch',3,12,20)]},
  {n:'Full body B',items:[it('legcurl',3,10,15),it('chestpress',3,8,12),it('rowing',3,8,12),it('elev',3,12,20),it('sdtr',3,8,12,120)]}]},
 hb:{n:'Haut / Bas',lvl:'Intermédiaire',sess:4,info:'4 séances par semaine, 60 min',progs:[
  {n:'Haut A',items:[it('couche',4,6,8,150),it('rowing',4,8,12),it('epaules',3,8,12),it('tirage',3,8,12),it('curl',3,10,15),it('triceps',3,10,15)]},
  {n:'Bas A',items:[it('squat',4,6,8,150),it('sdtr',3,8,12,120),it('legext',3,10,15),it('legcurl',3,10,15),it('mollets',4,12,20)]},
  {n:'Haut B',items:[it('incline',4,8,12),it('tractions',4,6,10,120),it('elev',3,12,20),it('rowbarre',3,8,12),it('curlh',3,10,15),it('triceps',3,10,15)]},
  {n:'Bas B',items:[it('presse',4,8,12,120),it('hipthrust',4,8,12),it('fentes',3,8,12),it('legcurl',3,10,15),it('crunch',3,12,20)]}]},
 ppl:{n:'Push / Pull / Legs',lvl:'Intermédiaire',sess:5,info:'3 à 6 séances par semaine, 60 min',progs:[
  {n:'Push',items:[it('couche',4,6,8,150),it('incline',3,8,12),it('epaules',3,8,12),it('elev',3,12,20),it('triceps',3,10,15)]},
  {n:'Pull',items:[it('tirage',4,8,12),it('rowing',3,8,12),it('pullover',3,10,15),it('oiseau',3,12,20),it('curl',3,10,15)]},
  {n:'Legs',items:[it('presse',4,8,12,120),it('sdtr',3,8,12,120),it('legext',3,10,15),it('legcurl',3,10,15),it('mollets',4,12,20)]}]},
 /* glute & leg focused programmes (cat:'f'), shown in their own section */
 gf:{cat:'f',n:'Fessiers débutante',lvl:'Débutant',sess:3,info:'3 séances par semaine, 50 min, tout le corps avec priorité fessiers',progs:[
  {n:'Fessiers A',items:[it('hipthrust',3,8,12,120),it('goblet',3,10,15),it('legcurl',3,10,15),it('abduction',3,15,20),it('tirage',3,8,12),it('crunch',3,12,20)]},
  {n:'Fessiers B',items:[it('presse',3,10,15,120),it('sdtr',3,8,12,120),it('fentes',3,10,12),it('kickpoulie',3,12,15),it('chestpress',3,8,12),it('elev',3,12,20)]}]},
 gl:{cat:'f',n:'Fessiers & cuisses',lvl:'Intermédiaire',sess:4,info:'4 séances par semaine, 60 min, 2 jours bas du corps',progs:[
  {n:'Fessiers',items:[it('hipthrust',4,6,10,150),it('bulgare',3,8,12,90),it('sdtr',3,8,12,120),it('kickpoulie',3,12,15),it('abduction',3,15,25)]},
  {n:'Haut A',items:[it('tirage',3,8,12),it('chestpress',3,8,12),it('rowing',3,8,12),it('elev',3,12,20),it('triceps',3,10,15),it('crunch',3,12,20)]},
  {n:'Cuisses',items:[it('squat',4,6,10,150),it('presse',3,10,15,120),it('legcurlallonge',3,10,15),it('legext',3,12,15),it('adduction',3,12,20),it('mollets',3,12,20)]},
  {n:'Haut B',items:[it('epaules',3,8,12),it('rowpoulie',3,8,12),it('incline',3,8,12),it('facepull',3,12,20),it('curlh',3,10,15),it('gainage',3,30,60)]}]},
 gb:{cat:'f',n:'Bas du corps 3 jours',lvl:'Intermédiaire',sess:3,info:'3 séances par semaine, fessiers, quadriceps, ischios',progs:[
  {n:'Fessiers lourds',items:[it('hipthrust',4,6,8,150),it('smithsquat',3,8,10,120),it('legcurl',3,10,15),it('abduction',3,15,25),it('crunch',3,12,20)]},
  {n:'Quadriceps',items:[it('hack',4,8,12,120),it('fentesmarche',3,10,12),it('legext',3,12,15),it('adduction',3,12,20),it('molletspresse',3,12,20)]},
  {n:'Ischios & fessiers',items:[it('sdtr',4,8,10,150),it('stepup',3,10,12),it('legcurlallonge',3,10,15),it('kickpoulie',3,12,15),it('pont',3,15,20)]}]},
 gh:{cat:'f',n:'Fessiers à la maison',lvl:'Débutant',sess:3,info:'3 séances par semaine, des haltères et une chaise ou un banc stable',progs:[
  {n:'Maison A',items:[it('goblet',3,12,15),it('pont',3,15,20),it('fentes',3,10,12),it('pompes',3,6,12),it('rowdb',3,10,12),it('gainage',3,30,60)]},
  {n:'Maison B',items:[it('bulgare',3,10,12),it('stepup',3,10,12),it('sdtrdb',3,10,12),it('epaulesdb',3,10,12),it('curlh',3,10,15),it('russian',3,15,20)]}]},
 f5:{n:'Force 5 × 5',lvl:'Intermédiaire',sess:3,info:'3 séances par semaine, charges lourdes',progs:[
  {n:'Force A',items:[it('squat',5,5,5,180),it('couche',5,5,5,180),it('rowbarre',5,5,5,150)]},
  {n:'Force B',items:[it('squat',5,5,5,180),it('militaire',5,5,5,150),it('souleve',1,5,5,180)]}]}
};
/* common foods per 100 g: name, kcal, protein, carbs, fat, usual portion g */
const FOODS=[['Blanc de poulet cuit',165,31,0,3.6,150],['Riz blanc cuit',130,2.7,28,.3,200],['Riz basmati cuit',121,3.5,25,.4,200],['Pâtes cuites',157,5.8,31,.9,200],
 ['Flocons d’avoine',372,13.5,59,7,80],['Pain complet',247,13,41,3.4,60],['Baguette',270,9,55,1.5,60],['Patate douce cuite',90,2,21,.1,200],['Pomme de terre cuite',86,1.9,20,.1,200],
 ['Banane',89,1.1,23,.3,120],['Pomme',52,.3,14,.2,150],['Myrtilles',57,.7,14,.3,100],['Orange',47,.9,12,.1,150],
 ['Œuf entier',143,12.6,.7,9.5,60],['Blanc d’œuf',52,11,.7,.2,100],['Fromage blanc 0 %',46,7.5,4,.1,250],['Skyr nature',63,11,4,.2,150],['Yaourt grec',97,9,4,5,150],
 ['Lait demi-écrémé',46,3.3,4.8,1.6,250],['Emmental',380,28,0,30,30],['Mozzarella',254,18,1,19.5,60],
 ['Steak haché 5 %',137,21,0,5.5,125],['Steak haché 15 %',214,18,0,15,125],['Saumon',208,20,0,13,125],['Thon au naturel',116,26,0,1,100],['Cabillaud',82,18,0,.7,150],['Jambon blanc',113,21,1,3,40],['Dinde (escalope)',109,24,0,1.5,150],
 ['Lentilles cuites',116,9,20,.4,200],['Pois chiches cuits',164,9,27,2.6,150],['Haricots verts',31,1.8,7,.2,200],['Brocoli',34,2.8,7,.4,200],['Épinards',23,2.9,3.6,.4,150],['Tomate',18,.9,3.9,.2,120],['Avocat',160,2,8.5,14.7,80],
 ['Amandes',579,21,22,50,30],['Noix',654,15,14,65,30],['Beurre de cacahuète',588,25,20,50,20],['Huile d’olive',884,0,0,100,10],['Chocolat noir 70 %',598,7.8,46,43,20],
 ['Whey protéine',380,78,8,5,30],['Barre protéinée',360,30,35,11,60],['Miel',304,.3,82,0,15],['Riz au lait',120,3.2,20,3,125]];
const MEALS=['Petit-déjeuner','Déjeuner','Collation','Dîner'];
const MEAS=[['bras','Bras'],['poitrine','Poitrine'],['taille','Taille'],['hanches','Hanches'],['cuisse','Cuisse'],['mollet','Mollet']];
const MOODS=[['ko','Épuisé'],['bof','Bof'],['bien','Bien'],['top','Au top']];
/* how hard the set felt. max = no rep left but the last one went up; hard = the last rep failed */
const FEEL={easy:'Facile',ok:'Juste',max:'À fond',hard:'Échec'};
const FEELD={easy:'3+ en réserve',ok:'1 ou 2 en réserve',max:'0 en réserve',hard:'dernière ratée'};
/* activity multipliers commonly used with Mifflin-St Jeor; approximations, not measurements */
const ACT={sed:['Sédentaire','Assis la plupart du temps',1.2],leger:['Peu actif','Debout de temps en temps, moins de 7 000 pas',1.375],actif:['Actif','Souvent debout, 7 000 à 12 000 pas',1.5],tres:['Très actif','Métier physique, plus de 12 000 pas',1.65]};
/* numeric bounds actually enforced in code (not only in HTML attributes) */
const LIM={kg:{load:[0,500],bw:[0,200],assist:[0,150]},r:{reps:[1,100],s:[1,3600],m:[1,10000]},bw:[25,350],meas:[10,250],a:[14,99],h:[120,230],q:[1,3000],k100:[0,900],mac100:[0,100],kman:[1000,6000],goal:[1,500]};

function progsFrom(k){return TPL[k].progs.map((p,i)=>({id:k+i,n:p.n,items:p.items.map(x=>({...x})),u:Date.now(),ver:1}))}
const libEx=()=>LIB.map(({q,...e})=>structuredClone(e));
const SEED=()=>({v:5,pn:'Full body',ex:libEx(),progs:progsFrom('fb'),cur:'fb0',logs:[],sess:[],food:[],myfoods:[],fav:[],tmeals:[],water:{},bw:[],meas:[],
 badges:{},goalsEx:{},wkGoal:{},chal:null,del:{},mt:{},
 prof:{name:'',sex:'h',w:75,h:178,a:28,goal:'masse',sess:3,act:'leger',kman:0,rest:90,step:2.5,bar:20,sound:1,water:2.5,kadj:0,kadjAt:'',onb:0,body:0,lastExp:''}});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
/* this device (never synced): used for the write lock and to know which open session belongs here */
let DEV='';try{DEV=localStorage.getItem('charge-dev')||'';if(!DEV){DEV='d'+uid();localStorage.setItem('charge-dev',DEV)}}catch(e){DEV='d'+uid()}

/* ================= small helpers ================= */
const key=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const today=()=>key(Date.now());
const addDays=(k,n)=>{const d=new Date(k+'T12:00');d.setDate(d.getDate()+n);return key(d)};
const at18=k=>new Date(k+'T18:00').getTime();
const fmt=v=>String(Math.round(v*10)/10).replace('.',',');
const fmt2=v=>String(Math.round(v*100)/100).replace('.',',');
const nf=v=>Math.round(v).toLocaleString('fr-FR');
const parseNum=v=>{const s=String(v??'').trim();if(!s)return NaN;const n=Number(s.replace(',','.').replace(/\s/g,''));return isFinite(n)?n:NaN};
const inR=(n,[a,b])=>typeof n==='number'&&isFinite(n)&&n>=a&&n<=b;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const pl=(n,w,ws)=>n+' '+(n>1?(ws||w+'s'):w);
const mmss=s=>Math.floor(s/60)+':'+String(Math.max(0,Math.floor(s%60))).padStart(2,'0');
const dShort=d=>new Date(d+'T12:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
const dLong=d=>new Date(d+'T12:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
const hm=t=>new Date(t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const mondayOf=k=>{const d=new Date(k+'T12:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return key(d)};
const daysAgo=k=>Math.round((Date.parse(today())-Date.parse(k))/864e5);
const agoTxt=k=>{const n=daysAgo(k);return n<=0?'aujourd’hui':n===1?'hier':'il y a '+n+' jours'};
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const pctTxt=p=>(p>0?'+':'')+p+' %';
const volTxt=v=>v>=1e4?fmt(v/1000)+' t':nf(v)+' kg';

/* ================= state ================= */
let S=SEED(),tab='seance',view={},REV=0,BAD=null;
/* derived data is recomputed only when the data changed (REV is bumped by every save) */
const memo=f=>{let r=-1,v;return ()=>{if(r!==REV){v=f();r=REV}return v}};

/* ---------- exercises and how a set is measured ---------- */
const libOf=id=>LIB.find(l=>l.id===id);
const exo=id=>S.ex.find(e=>e.id===id)||{id,n:nameSnap(id)||'Exercice supprimé',m:['abdos'],k:'machine',c:0,seat:''};
const ltE=e=>e.lt||(e.k==='pdc'?'bw':'load');
const unE=e=>e.unit||UNITS[e.id]||'reps';
const ltOf=id=>ltE(exo(id));
const uOf=id=>unE(exo(id));
const ltL=l=>l.lt||ltOf(l.e);
const unL=l=>l.un||uOf(l.e);
/* the history of an exercise that is comparable with how it is measured today */
const sameM=(l,id)=>ltL(l)===ltOf(id)&&unL(l)===uOf(id);
const incOf=id=>exo(id).inc||S.prof.step||2.5;
const rnd=(v,id)=>{const st=id?incOf(id):(S.prof.step||2.5);return Math.round(v/st)*st};
/* 1RM (Epley) only for a weight lifted 1 to 12 times; always shown as an estimate */
const orm=(kg,r)=>r<=1?kg:kg*(1+r/30);
const ormOk=l=>!l.w&&unL(l)==='reps'&&ltL(l)==='load'&&l.kg>0&&l.r>=1&&l.r<=12;
function loadTxt(lt,kg){return lt==='load'?fmt(kg)+' kg':lt==='bw'?(kg>0?'PDC + '+fmt(kg)+' kg':'PDC'):'assist. '+fmt(kg)+' kg'}
/* one set as text, with the measure the set was recorded with */
function setTxt(l){const u=unL(l),lt=ltL(l),r=u==='reps'?String(l.r):l.r+' '+UL[u][0];let a;
 if(u==='reps')a=loadTxt(lt,l.kg)+' × '+r;else a=r+(l.kg>0||lt==='assist'?' · '+loadTxt(lt,l.kg):'');
 if(l.dr?.length)a+=' → '+l.dr.map(d=>fmt(d.kg)+' × '+d.r).join(' → ');return a}
/* volume = kg × reps of working sets, drop-set steps included; seconds, metres and assistance give none */
const setVol=l=>{if(l.w||unL(l)!=='reps'||ltL(l)==='assist')return 0;return l.kg*l.r+(l.dr||[]).reduce((a,d)=>a+d.kg*d.r,0)};
const vol=L=>L.reduce((s,l)=>s+setVol(l),0);

/* ---------- logs & sessions (indexed once per data revision) ---------- */
const IDX=memo(()=>{const L=S.logs.slice().sort((a,b)=>a.t-b.t),byE=new Map(),byS=new Map();
 for(const l of L){if(!byE.has(l.e))byE.set(l.e,[]);byE.get(l.e).push(l);if(!byS.has(l.sid))byS.set(l.sid,[]);byS.get(l.sid).push(l)}
 return {L,byE,byS}});
const logsOf=id=>IDX().byE.get(id)||[];
const allWorkOf=id=>logsOf(id).filter(l=>!l.w);
const workOf=id=>allWorkOf(id).filter(l=>sameM(l,id));
const sLogs=sid=>IDX().byS.get(sid)||[];
const sWork=sid=>sLogs(sid).filter(l=>!l.w);
const sessById=id=>S.sess.find(s=>s.id===id);
const lastAct=s=>Math.max(s.start,sLogs(s.id).at(-1)?.t||0);
/* several sessions can be open (two devices): this device works on the one it started, else the most recent */
let PREF='';try{PREF=localStorage.getItem('charge-cur')||''}catch(e){}
const setPref=id=>{PREF=id||'';try{id?localStorage.setItem('charge-cur',id):localStorage.removeItem('charge-cur')}catch(e){}};
const ACTS=memo(()=>S.sess.filter(s=>s.state==='active').sort((a,b)=>lastAct(b)-lastAct(a)));
const active=()=>{const L=ACTS();return L.find(s=>s.id===PREF)||L[0]||null};
const otherActives=()=>{const a=active();return ACTS().filter(s=>s!==a)};
/* a finished session counts only if it holds at least one working set */
const doneSess=memo(()=>S.sess.filter(s=>s.state==='done'&&sWork(s.id).length).sort((a,b)=>a.start-b.start));
const sessOfDay=d=>S.sess.filter(s=>key(s.start)===d&&(s.state==='active'||sLogs(s.id).length)).sort((a,b)=>a.start-b.start);
const isStale=s=>s&&s.state==='active'&&Date.now()-lastAct(s)>6*36e5;
const sessMins=s=>{const L=sLogs(s.id);if(!L.length)return 0;const end=s.end||L.at(-1).t;return Math.max(1,Math.round((end-Math.min(s.start,L[0].t))/6e4))};
const nameSnap=id=>{for(const s of S.sess){const x=s.plan?.find(p=>p.id===id);if(x?.n)return x.n}return null};
const sessName=s=>s.pn||'Séance';

/* ---------- programme & plan of the session ---------- */
const prog=()=>S.progs.find(p=>p.id===S.cur)||S.progs[0]||{id:'',n:'Séance',items:[]};
const pname=id=>S.progs.find(p=>p.id===id)?.n;
const previewPlan=()=>dedupe(prog().items.map(x=>({...x,n:exo(x.id).n})));
/* one exercise appears once in a session: a second occurrence would share the same sets */
const dedupe=P=>{const seen=new Set();return P.filter(x=>!seen.has(x.id)&&seen.add(x.id))};
/* the active session keeps its own copy of the plan: editing the programme never changes a session in progress */
const plan=()=>{const a=active();return a?a.plan:previewPlan()};
const planItem=id=>plan().find(x=>x.id===id);
const restOf=id=>planItem(id)?.rest||S.prof.rest;
const curLogs=id=>{const a=active();return a?sLogs(a.id).filter(l=>l.e===id):[]};
const curWork=id=>curLogs(id).filter(l=>!l.w);
/* comparable working sets of the last other session that contains this exercise */
function lastWork(id){const a=active(),W=workOf(id).filter(l=>!a||l.sid!==a.id);if(!W.length)return null;const sid=W.at(-1).sid;return W.filter(l=>l.sid===sid)}
const lastOne=id=>lastWork(id)?.at(-1)||null;
const repTxt=(p,id)=>{const u=uOf(id||p.id),r=p.rmin===p.rmax?String(p.rmin):p.rmin+' à '+p.rmax;return u==='reps'?r:r+' '+UL[u][0]};

/* double progression inside a rep range.
   Working load = heaviest load of last time. Go up only when at least S sets (S = planned) were done at that load,
   all of them reaching the top of the range, none failed. Lighter sets (ramp-up, back-off) are ignored. */
function target(id){const p=planItem(id),ls=lastWork(id);if(!ls)return null;
 const s=p?.s||1,rmin=p?.rmin||ls[0].r,rmax=p?.rmax||rmin,u=uOf(id),lt=ltOf(id),inc=incOf(id);
 const eff=l=>lt==='assist'?-l.kg:l.kg,top=Math.max(...ls.map(eff)),atTop=ls.filter(l=>Math.abs(eff(l)-top)<1e-9),mx=atTop[0].kg;
 const bestAtTop=Math.max(...atTop.map(l=>l.r)),failed=atTop.some(l=>l.f==='hard');
 const ok=atTop.length>=s&&atTop.slice(0,s).every(l=>l.r>=rmax)&&!failed;
 const rule=`Pour monter : ${pl(s,'série')} à ${loadTxt(lt,mx)} avec ${rmax} ${u==='reps'?'répétitions':UL[u][0]}, sans échec.`;
 if(u!=='reps')return {kg:mx,r:bestAtTop,up:false,why:'Fais au moins autant que la dernière fois.',rule:''};
 if(ok){if(lt==='assist')return mx>0?{kg:Math.max(0,mx-inc),r:rmin,up:true,why:'Tu as réussi '+pl(s,'série')+' à '+rmax+' : moins d’assistance.',rule}:{kg:0,r:Math.min(rmax+1,100),up:true,why:'Sans assistance : vise une répétition de plus.',rule};
  if(lt==='bw'&&mx===0)return {kg:0,r:Math.min(rmax+1,100),up:true,why:'Tu as réussi '+pl(s,'série')+' à '+rmax+' : une répétition de plus, ou ajoute un lest.',rule};
  return {kg:mx+inc,r:rmin,up:true,why:'Tu as réussi '+pl(s,'série')+' à '+rmax+' répétitions sans échec : +'+fmt(inc)+' kg.',rule}}
 return {kg:mx,r:Math.max(rmin,Math.min(rmax,bestAtTop+(failed?0:1))),up:false,why:failed?'Une série a échoué la dernière fois : même charge.':atTop.length<s?'La dernière fois, '+pl(atTop.length,'série')+' à cette charge sur '+s+' prévues.':'Même charge, une répétition de plus.',rule}}

/* superset = an item flagged ss is chained with the next one (pairs only) */
function pairOf(id){const P=plan(),i=P.findIndex(x=>x.id===id);if(i<0)return null;if(P[i].ss&&P[i+1])return {a:P[i],b:P[i+1]};if(i>0&&P[i-1].ss)return {a:P[i-1],b:P[i]};return null}
function nextEx(id){const P=plan(),i=P.findIndex(x=>x.id===id);for(let k=1;k<=P.length;k++){const q=P[(i+k+P.length)%P.length];if(q&&curWork(q.id).length<q.s)return q.id}return null}
function afterRest(id){const rem=x=>x&&curWork(x.id).length<x.s,pr=pairOf(id);if(pr){if(rem(pr.a))return pr.a.id;if(rem(pr.b))return pr.b.id}
 if(rem(planItem(id)))return id;return nextEx(id)}
/* next programme in the rotation, after the one of the last finished session */
function suggested(){const D=doneSess(),last=[...D].reverse().find(s=>S.progs.some(p=>p.id===s.p));if(!last||S.progs.length<2)return null;
 const i=S.progs.findIndex(p=>p.id===last.p);return S.progs[(i+1)%S.progs.length].id}

/* ---------- records (compared only between sets measured the same way) ----------
   weight & reps: beats the heaviest load, or the best estimated 1RM (1–12 reps).
   body weight, assistance, seconds, metres: a harder load than ever, or more reps / seconds / metres at the hardest load.
   Warm-ups and drop-set steps never count; the very first set is not a record. */
const RECS=memo(()=>{const out=new Set(),st={};
 for(const l of IDX().L){if(l.w)continue;const u=unL(l),lt=ltL(l),k=l.e+'|'+lt+'|'+u,b=st[k]||(st[k]={n:0,kg:0,o:0,eff:-Infinity,r:0});
  if(u==='reps'&&lt==='load'){const o=ormOk(l)?orm(l.kg,l.r):0;if(b.n&&(l.kg>b.kg+.01||(o&&o>b.o+.01)))out.add(l.id);b.kg=Math.max(b.kg,l.kg);b.o=Math.max(b.o,o)}
  else{const eff=lt==='assist'?-l.kg:l.kg;if(b.n&&(eff>b.eff+.001||(Math.abs(eff-b.eff)<=.001&&l.r>b.r)))out.add(l.id);if(eff>b.eff+.001){b.eff=eff;b.r=l.r}else if(Math.abs(eff-b.eff)<=.001)b.r=Math.max(b.r,l.r)}
  b.n++}
 return out});
const isRec=l=>RECS().has(l.id);
const best=id=>workOf(id).reduce((b,l)=>Math.max(b,l.kg),0);
const best1=id=>workOf(id).filter(ormOk).reduce((b,l)=>Math.max(b,orm(l.kg,l.r)),0);
const bestReps=id=>workOf(id).reduce((b,l)=>Math.max(b,l.r),0);
function bestSet(id,from=0){const W=workOf(id).filter(l=>l.t>=from);if(!W.length)return null;const u=uOf(id),lt=ltOf(id);
 if(u==='reps'&&lt==='load')return W.reduce((b,l)=>!b||(ormOk(l)?orm(l.kg,l.r):l.kg)>(ormOk(b)?orm(b.kg,b.r):b.kg)?l:b,null);
 const eff=l=>lt==='assist'?-l.kg:l.kg;return W.reduce((b,l)=>!b||eff(l)>eff(b)||(eff(l)===eff(b)&&l.r>b.r)?l:b,null)}

/* ---------- body weight at a date ---------- */
const wNow=()=>{const b=S.bw.slice().sort((a,c)=>a.d<c.d?-1:1).at(-1);return b?b.kg:S.prof.w};
function wAt(t){const d=key(t),B=S.bw.filter(b=>b.d<=d).sort((a,c)=>a.d<c.d?-1:1);return B.length?B.at(-1).kg:(S.bw.slice().sort((a,c)=>a.d<c.d?-1:1)[0]?.kg||S.prof.w)}

/* ---------- weeks, streak, XP ----------
   XP rewards showing up, not tonnage (a heavy leg press would otherwise outscore pull-ups or planks):
   50 per finished session, +100 for the session that reaches the week's goal, +30 per exercise in record (3 max). */
const wkGoal=m=>S.wkGoal?.[m]?.g??S.prof.sess;
const WEEKS=memo(()=>{const W={};doneSess().forEach(s=>{const m=mondayOf(key(s.start));(W[m]=W[m]||[]).push(s)});return W});
const weekN=m=>(WEEKS()[m]||[]).length;
function streak(){const W=WEEKS();let m=mondayOf(today()),n=0;if(!W[m])m=addDays(m,-7);while(W[m]){n++;m=addDays(m,-7)}return n}
function maxStreak(){const K=Object.keys(WEEKS()).sort();let b=0,run=0,prev=null;K.forEach(w=>{run=prev&&addDays(prev,7)===w?run+1:1;b=Math.max(b,run);prev=w});return b}
const XP=memo(()=>{const by={},W=WEEKS();let tot=0,v=0;const prs=new Set();
 doneSess().forEach(s=>{const L=sWork(s.id),rec=new Set(L.filter(isRec).map(l=>l.e)),m=mondayOf(key(s.start)),idx=W[m].indexOf(s)+1;
  const x={sess:50,recs:Math.min(3,rec.size)*30,nrec:rec.size,week:idx===wkGoal(m)?100:0};x.total=x.sess+x.recs+x.week;by[s.id]=x;tot+=x.total;v+=vol(L);rec.forEach(e=>prs.add(s.id+e))});
 const lvl=lvlOf(tot),cur=120*(lvl-1)**2,next=120*lvl**2;
 return {xp:tot,lvl,cur,next,frac:(tot-cur)/(next-cur),by,prs:prs.size,sessions:doneSess().length,weeksOk:Object.keys(W).filter(m=>W[m].length>=wkGoal(m)).length,vol:v}});
function lvlOf(xp){return Math.floor(Math.sqrt(xp/120))+1}

/* ================= nutrition maths =================
   Resting energy: Mifflin-St Jeor equation (Mifflin et al., Am J Clin Nutr 1990), an estimate for groups, not a measure of you.
   × an activity multiplier (common approximation) + 2,5 % per weekly session (app approximation).
   Protein 2 g/kg (2,2 in a cut): research puts the useful range around 1,6 to 2,2 g/kg (Morton et al., Br J Sports Med 2018). */
/* floor: never below resting energy nor 1 200 kcal (women) / 1 500 kcal (men), the usual limits without medical follow-up; a cut is at most 20 % of expenditure */
const KFLOOR=()=>S.prof.sex==='f'?1200:1500;
function goals(){const p=S.prof,w=wNow(),a=(ACT[p.act]||ACT.leger)[2],act=Math.round((a+0.025*Math.min(7,Math.max(0,p.sess)))*1000)/1000;
 const bmr=10*w+6.25*p.h-5*p.a+(p.sex==='f'?-161:5),tdee=bmr*act,off=Math.round(p.goal==='seche'?-Math.min(400,.2*tdee):p.goal==='masse'?300:0);
 const raw=Math.round((tdee+off+(p.kadj||0))/10)*10,floor=Math.max(KFLOOR(),Math.round(bmr/10)*10),auto=Math.max(floor,raw),k=p.kman>0?p.kman:auto;
 const pr=Math.round((p.goal==='seche'?2.2:2)*w),li=Math.round(w*(p.goal==='seche'?.8:1));
 return {k,auto,man:p.kman>0,p:pr,l:li,g:Math.max(0,Math.round((k-pr*4-li*9)/4)),bmr:Math.round(bmr),act,off,floored:raw<floor}}
/* weekly change targets in % of body weight (Helms et al., JISSN 2014: 0,5 à 1 % par semaine en sèche) */
const WTGT={masse:[.25,.5],seche:[-1,-.5],maintien:[-.25,.25]};
const nutDay=d=>S.food.filter(f=>f.d===d).reduce((a,f)=>({k:a.k+f.k,p:a.p+f.p,g:a.g+f.g,l:a.l+f.l}),{k:0,p:0,g:0,l:0});
const waterN=d=>S.water[d]?.n||0;
/* weekly weight trend (kg/week), least squares over the last 28 days; needs 4 weigh-ins over ≥ 14 days */
function trend(){const B=S.bw.filter(b=>Date.parse(b.d)>=Date.now()-28*864e5).sort((a,b)=>a.d<b.d?-1:1);if(B.length<4)return null;
 const x=B.map(b=>Date.parse(b.d)/864e5),y=B.map(b=>b.kg);if(x.at(-1)-x[0]<14)return null;
 const mx=x.reduce((a,b)=>a+b)/x.length,my=y.reduce((a,b)=>a+b)/y.length;
 return x.reduce((s,xi,i)=>s+(xi-mx)*(y[i]-my),0)/x.reduce((s,xi)=>s+(xi-mx)**2,0)*7}
/* an adjustment is suggested only with enough data: the trend above AND meals logged at least 5 of the last 7 days */
function adjustTip(){if(S.prof.kman>0)return null;const r=trend();if(r==null)return null;
 const logged=[...Array(7)].map((_,i)=>addDays(today(),-i-1)).filter(d=>nutDay(d).k>800).length;if(logged<5)return null;
 if(S.prof.kadjAt&&Date.now()-Date.parse(S.prof.kadjAt)<14*864e5)return null;const g=S.prof.goal,T=WTGT[g]||WTGT.maintien,pc=r/wNow()*100;let d=0,why='';
 if(pc<T[0]){d=150;why=g==='seche'?'Tu perds plus de 1 % de ton poids par semaine':g==='masse'?'Ton poids ne monte presque pas':'Ton poids descend'}
 else if(pc>T[1]){d=-150;why=g==='seche'?'Ton poids ne descend presque pas':g==='masse'?'Tu prends plus de 0,5 % de ton poids par semaine':'Ton poids monte'}
 const kadj=(S.prof.kadj||0)+d;if(d&&(kadj<-500||kadj>500))return null;if(d<0&&goals().auto+d<Math.max(KFLOOR(),goals().bmr))return null;
 return d?{d,r,pc,why,logged}:null}

/* ================= mutations =================
   Every record carries a version (ver) and a time (u). A deletion remembers the version it deleted, forever:
   a copy from a device with a wrong clock, or one that stayed offline for months, cannot bring it back. */
const tombOf=(c,k)=>S.del?.[c+':'+k];
function stamp(o,c,k){const d=c?tombOf(c,k):null,base=d&&typeof d==='object'?d.v||0:0;o.ver=Math.max(o.ver||0,base)+1;o.u=Date.now();return o}
const touch=f=>{S.mt=S.mt||{};S.mt[f]=Date.now()};
const tomb=(c,k,ver)=>{if(ver==null){const L=S[c];ver=Array.isArray(L)?L.find(x=>COLL[c]?.(x)===k)?.ver:L?.[k]?.ver}S.del=S.del||{};const d=S.del[c+':'+k];S.del[c+':'+k]={t:Date.now(),v:Math.max(ver||0,d&&typeof d==='object'?d.v||0:0)}};
function addLog(l){l.id=l.id||'l'+uid();if(!l.lt)l.lt=ltOf(l.e);if(!l.un)l.un=uOf(l.e);stamp(l,'logs',l.id);S.logs.push(l);return l}
function delLog(id){const l=S.logs.find(x=>x.id===id);S.logs=S.logs.filter(x=>x.id!==id);tomb('logs',id,l?.ver);return l}
function startSession(){const p=prog(),s=stamp({id:'s'+uid(),start:Date.now(),end:null,state:'active',p:p.id,pn:p.n,plan:previewPlan(),dev:DEV});S.sess.push(s);setPref(s.id);REV++;return s}
function ensureSession(){const a=active();if(a&&isStale(a)&&key(lastAct(a))!==today()){if(sWork(a.id).length)closeSession(a);else delSession(a.id);REV++;return active()&&!isStale(active())?active():startSession()}return a||startSession()}
function delSession(id){const s=sessById(id);sLogs(id).forEach(l=>delLog(l.id));S.sess=S.sess.filter(x=>x.id!==id);tomb('sess',id,s?.ver);if(PREF===id)setPref('')}
function closeSession(s,{note,mood}={}){const L=sLogs(s.id),lastT=L.at(-1)?.t||s.start;
 s.state='done';s.end=Date.now()-lastT>2*36e5?lastT+5*6e4:Math.max(Date.now(),lastT);if(note!=null)s.note=note;if(mood)s.mood=mood;stamp(s);if(PREF===s.id)setPref('');
 /* the weekly goal of that week is frozen: changing the goal later never rewrites a week already counted */
 const m=mondayOf(key(s.start));S.wkGoal=S.wkGoal||{};if(!S.wkGoal[m])S.wkGoal[m]={g:S.prof.sess,u:Date.now()};
 const nx=S.progs.findIndex(p=>p.id===s.p);if(nx>=0&&S.progs.length>1){S.cur=S.progs[(nx+1)%S.progs.length].id;touch('cur')}}

/* ================= storage =================
   Honest states: a message says a copy exists only once the write has been confirmed. */
let localErr='',sync='local',dbDoc=null,lockDoc=null,pushT=0,pushTry=0,pushing=false,pushAgain=false,lastSaved=0,persisted=null;
let rescue={state:'none',at:0};/* none | pending | ok | fail */
function persistLocal(){if(BAD)return false;
 try{localStorage.setItem('charge',JSON.stringify(S));localErr='';lastSaved=Date.now();
  if(rescue.state!=='none'){rescue={state:'none',at:0};IDB.del('rescue','cur').catch(()=>{})}return true}
 catch(e){localErr=e&&(e.name==='QuotaExceededError'||e.code===22)?'stockage plein':'stockage refusé';
  if(rescue.state!=='pending'){rescue={state:'pending',at:Date.now()};
   IDB.put('rescue',{k:'cur',at:Date.now(),json:JSON.stringify(S)}).then(()=>{rescue={state:'ok',at:Date.now()};banner()}).catch(()=>{rescue={state:'fail',at:Date.now()};banner()})}
  else IDB.put('rescue',{k:'cur',at:Date.now(),json:JSON.stringify(S)}).then(()=>{rescue={state:'ok',at:Date.now()};banner()}).catch(()=>{rescue={state:'fail',at:Date.now()};banner()});
  return false}}
function save(){REV++;const ok=persistLocal();banner();if(dbDoc){clearTimeout(pushT);pushT=setTimeout(pushCloud,800)}if(typeof gLive==='function'&&gOn()&&gLive()){clearTimeout(G.timer);G.timer=setTimeout(gSync,1500)}return ok}
function banner(){const b=$('#savebar');if(!b)return;let msg='';
 if(localErr){msg=`Cet appareil refuse l’enregistrement (${localErr}). `+({pending:'Copie de secours en cours d’écriture…',ok:`Copie de secours enregistrée à ${hm(rescue.at)}, elle sera reprise au prochain lancement.`,fail:'La copie de secours a aussi échoué : tes dernières saisies ne sont qu’en mémoire. Exporte maintenant.',none:''}[rescue.state]||'')+(dbDoc&&sync==='cloud'?' Ton compte Claude, lui, est à jour.':'')}
 else if(dbDoc&&sync==='erreur')msg='Envoi vers ton compte Claude échoué. Tout est enregistré sur cet appareil ; nouvel essai automatique.';
 b.innerHTML=msg?`<div class="savebar" role="alert"><span>${msg}</span>${localErr?'<button data-a="export">Exporter</button>':''}<button class="sec" data-a="retrysave">Réessayer</button></div>`:''}
/* IndexedDB: progress photos, backups before risky operations, rescue copy when localStorage refuses */
const IDB={db:null,
 open(){if(this.db)return Promise.resolve(this.db);return new Promise((ok,ko)=>{try{const r=indexedDB.open('charge-photos',2);
  r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('p'))d.createObjectStore('p',{keyPath:'id'});if(!d.objectStoreNames.contains('bak'))d.createObjectStore('bak',{keyPath:'at'});if(!d.objectStoreNames.contains('rescue'))d.createObjectStore('rescue',{keyPath:'k'})};
  r.onsuccess=()=>ok(this.db=r.result);r.onerror=()=>ko(r.error);r.onblocked=()=>ko(new Error('blocked'))}catch(e){ko(e)}})},
 async all(st){const db=await this.open();return new Promise((ok,ko)=>{const q=db.transaction(st).objectStore(st).getAll();q.onsuccess=()=>ok(q.result);q.onerror=()=>ko(q.error)})},
 async get(st,k){const db=await this.open();return new Promise((ok,ko)=>{const q=db.transaction(st).objectStore(st).get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>ko(q.error)})},
 async put(st,o){const db=await this.open();return new Promise((ok,ko)=>{const t=db.transaction(st,'readwrite');t.objectStore(st).put(o);t.oncomplete=()=>ok(true);t.onerror=()=>ko(t.error);t.onabort=()=>ko(t.error||new Error('abort'))})},
 async del(st,k){const db=await this.open();return new Promise((ok,ko)=>{const t=db.transaction(st,'readwrite');t.objectStore(st).delete(k);t.oncomplete=ok;t.onerror=()=>ko(t.error)})}};
/* keep the 5 latest backups. Returns where the copy was confirmed: 'idb', 'ls' (only the latest one fits there) or '' (none) */
async function backup(why,raw){raw=raw??JSON.stringify(S);let where='';const at=Date.now();
 try{await IDB.put('bak',{at,why,json:raw});const got=await IDB.get('bak',at);if(got&&got.json===raw)where='idb';const B=(await IDB.all('bak')).sort((a,b)=>b.at-a.at);for(const x of B.slice(5))await IDB.del('bak',x.at)}catch(e){}
 if(!where){try{localStorage.setItem('charge-bak',JSON.stringify([{at,why,json:raw}]));if(JSON.parse(localStorage.getItem('charge-bak'))[0].json===raw)where='ls'}catch(e){}}
 return where}
async function listBackups(){let L=[];try{L=(await IDB.all('bak')).map(b=>({...b,src:'idb'}))}catch(e){}try{(JSON.parse(localStorage.getItem('charge-bak')||'[]')||[]).forEach(b=>{if(!L.some(x=>x.at===b.at))L.push({...b,src:'ls'})})}catch(e){}return L.sort((a,b)=>b.at-a.at)}

/* ---------- migration v1 → v5 (no information invented) ---------- */
const okId=x=>typeof x==='string'&&/^[\w-]{1,80}$/.test(x);
function migrate(o){if(!o||typeof o!=='object'||Array.isArray(o))throw new Error('format');o=structuredClone(o);const v=o.v||1;
 if(!Array.isArray(o.progs)){o.progs=[{id:'A',n:'Séance A',items:Array.isArray(o.plan)?o.plan:[]}];o.cur='A'}
 delete o.plan;
 const cl=(v,a,b,d)=>{v=Math.round(Number(v));return isFinite(v)?Math.min(b,Math.max(a,v)):d};
 const item=x=>{const r=cl(x.rmin??x.r,1,10000,10),y={id:String(x.id),s:cl(x.s,1,20,3),rmin:r,rmax:Math.max(r,cl(x.rmax??r,1,10000,r))};if(x.rest)y.rest=cl(x.rest,10,900,90);if(x.ss)y.ss=1;if(x.extra)y.extra=1;if(x.orig)y.orig=String(x.orig);if(x.n)y.n=String(x.n);return y};
 o.progs=o.progs.filter(p=>p&&okId(String(p.id))).map(p=>({id:String(p.id),n:String(p.n||'Séance'),u:p.u||0,ver:p.ver||0,items:dedupe((Array.isArray(p.items)?p.items:[]).filter(x=>x&&okId(String(x.id))).map(item))}));
 const ex=(Array.isArray(o.ex)?o.ex:[]).filter(e=>e&&okId(e.id));
 LIB.forEach(l=>{const e=ex.find(x=>x.id===l.id),{q,...b}=l;if(e){e.n=b.n;e.m=b.m.slice();e.k=b.k;e.c=b.c;delete e.q}else ex.push(structuredClone(b))});
 /* v4 stored the unit in e.u, the same field as the change time: a text value is a unit, a number is a time */
 ex.forEach(e=>{e.k=KINDS[e.k]?e.k:'machine';e.c=e.c?1:0;e.seat=e.seat||'';e.m=Array.isArray(e.m)&&e.m.length?e.m:['pectoraux'];
  if(typeof e.u==='string'){if(UL[e.u]&&!e.unit)e.unit=e.u;delete e.u}if(e.u!=null&&!(typeof e.u==='number'&&isFinite(e.u)))delete e.u;if(e.unit&&!UL[e.unit])delete e.unit;if(e.lt&&!LTL[e.lt])delete e.lt});o.ex=ex;
 const P=Object.assign({},SEED().prof,o.prof||{});
 if(v<3&&Array.isArray(o.logs)&&o.logs.length)P.onb=1;
 if(!ACT[P.act])P.act='leger';
 const P0=SEED().prof;Object.keys(P0).forEach(k=>{if(typeof P0[k]==='number'&&!(typeof P[k]==='number'&&isFinite(P[k])))P[k]=P0[k]});
 if(!['masse','maintien','seche'].includes(P.goal))P.goal='masse';
 if(v<5&&(Array.isArray(o.logs)&&o.logs.length||P.onb))P.body=1;o.prof=P;
 ['myfoods','fav','tmeals','bw','meas','logs','food'].forEach(k=>{if(!Array.isArray(o[k]))o[k]=[]});
 o.food=o.food.map(f=>f.id?f:{...f,id:uid()});
 o.tmeals=o.tmeals.map(t=>t.id?t:{...t,id:'t'+uid()});
 const W={};Object.entries(o.water&&typeof o.water==='object'?o.water:{}).forEach(([d,x])=>{const n=typeof x==='number'?x:x?.n;if(typeof n==='number'&&n>=0)W[d]={n,u:x?.u||0,ver:x?.ver||0}});o.water=W;
 const B={};Object.entries(o.badges&&typeof o.badges==='object'?o.badges:{}).forEach(([k,x])=>{if(typeof x==='string')B[k]={d:x,u:0};else if(x&&x.d)B[k]=x});o.badges=B;
 o.goalsEx=o.goalsEx&&typeof o.goalsEx==='object'?o.goalsEx:{};o.wkGoal=o.wkGoal&&typeof o.wkGoal==='object'?o.wkGoal:{};o.del=o.del&&typeof o.del==='object'?o.del:{};o.mt=o.mt&&typeof o.mt==='object'?o.mt:{};
 if(!Array.isArray(o.sess)){
  /* v3 had no session: sets of the same calendar day were one session. Rebuild one session per day, from the sets only. */
  const old=Array.isArray(o.sessions)?o.sessions:[],byD={},t0=today();
  o.logs.sort((a,b)=>a.t-b.t).forEach(l=>{const d=key(l.t);(byD[d]=byD[d]||[]).push(l)});
  o.sess=Object.entries(byD).map(([d,L])=>{const meta=old.find(x=>x.d===d)||{},cnt={};L.forEach(l=>{if(l.p)cnt[l.p]=(cnt[l.p]||0)+1});
   const p=meta.p||Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]||'',pp=o.progs.find(x=>x.id===p);
   const order=[...new Set(L.map(l=>l.e))];
   const isOpen=d===t0&&!meta.d;let pl=order.map(e=>{const ls=L.filter(l=>l.e===e);return {id:e,s:ls.length,rmin:ls[0].r,rmax:ls[0].r}});
   if(isOpen&&pp){const day=o.day&&o.day.d===d?o.day:{swap:{},extra:[]};pl=pp.items.map(x=>day.swap?.[x.id]?{...x,id:day.swap[x.id],orig:x.id}:{...x});(day.extra||[]).forEach(e=>{if(!pl.some(x=>x.id===e))pl.push({id:e,s:3,rmin:10,rmax:10,extra:1})});order.forEach(e=>{if(!pl.some(x=>x.id===e))pl.push({id:e,s:L.filter(l=>l.e===e).length,rmin:10,rmax:10,extra:1})})}
   pl=dedupe(pl.map(item));pl.forEach(x=>{const e=ex.find(y=>y.id===x.id);if(e)x.n=e.n});
   const s={id:'s'+d.replace(/-/g,''),start:L[0].t,end:isOpen?null:L.at(-1).t,state:isOpen?'active':'done',p,pn:pp?.n||null,plan:pl,legacy:1,u:L.at(-1).t};
   if(meta.note)s.note=meta.note;if(meta.mood)s.mood=meta.mood;return s});
  o.logs.forEach(l=>{l.sid='s'+key(l.t).replace(/-/g,'')});
  o.sess.filter(s=>s.state==='done').forEach(s=>{const m=mondayOf(key(s.start));if(!o.wkGoal[m])o.wkGoal[m]={g:P.sess,u:0}})}
 o.sess=o.sess.filter(s=>s&&okId(s.id)).map(s=>({...s,plan:dedupe((Array.isArray(s.plan)?s.plan:[]).filter(x=>x&&okId(String(x.id))).map(item))}));
 /* every set keeps the measure it was recorded with (filled from the exercise definition known today) */
 const exM=new Map(ex.map(e=>[e.id,e]));
 o.logs=o.logs.map(l=>{const y={...l};y.id=y.id||'l'+y.t.toString(36)+'-'+String(y.e).slice(0,12);if(y.f&&!FEEL[y.f])delete y.f;if(y.dr&&!y.dr.length)delete y.dr;y.u=y.u||y.t;
  const e=exM.get(y.e)||{id:y.e,k:'machine'};if(!LTL[y.lt])y.lt=ltE(e);if(!UL[y.un])y.un=unE(e);return y});
 const ids=new Set();o.logs=o.logs.filter(l=>okId(l.id)&&okId(l.e)&&okId(l.sid)&&!ids.has(l.id)&&ids.add(l.id));
 o.food=o.food.filter(f=>okId(f.id));o.tmeals=o.tmeals.filter(t=>okId(t.id));
 delete o.sessions;delete o.day;delete o.chal;delete o.goalsExDone;
 o.pn=o.pn||'Mon programme';o.cur=o.progs.some(p=>p.id===o.cur)?o.cur:o.progs[0]?.id||'';o.v=5;return o}
const fromJSON=j=>migrate(JSON.parse(j));

/* ---------- full schema check of v5 data (after every migration, before any import replaces anything) ---------- */
function validate(o){const E=[],D=/^\d{4}-\d\d-\d\d$/,F=v=>typeof v==='number'&&isFinite(v),str=v=>typeof v==='string'&&v.length>0,push=m=>{if(E.length<8)E.push(m)};
 const items=(L,w)=>{if(!Array.isArray(L))return push(w+' : liste d’exercices absente');L.forEach((x,i)=>{if(!x||!str(x.id))push(w+', exercice '+(i+1)+' : identifiant manquant');else if(!(Number.isInteger(x.s)&&x.s>=1&&x.s<=20))push(w+', '+x.id+' : nombre de séries invalide');else if(!(Number.isInteger(x.rmin)&&Number.isInteger(x.rmax)&&x.rmin>=1&&x.rmax>=x.rmin&&x.rmax<=10000))push(w+', '+x.id+' : répétitions invalides');else if(x.rest!=null&&!(F(x.rest)&&x.rest>=10&&x.rest<=900))push(w+', '+x.id+' : repos invalide')})};
 ['logs','sess','progs','ex','food','bw','meas','myfoods','tmeals','fav'].forEach(k=>{if(!Array.isArray(o[k]))push(k+' n’est pas une liste')});if(E.length)return E;
 const sids=new Set(o.sess.map(s=>s.id));
 o.sess.forEach((s,i)=>{if(!s||!str(s.id))return push('séance '+(i+1)+' : identifiant manquant');if(!F(s.start)||s.start<946684800000||s.start>Date.now()+2*864e5)push('séance '+(i+1)+' : début invalide');
  if(s.end!=null&&!(F(s.end)&&s.end>=s.start-6e4))push('séance '+(i+1)+' : fin invalide');if(!['active','done'].includes(s.state))push('séance '+(i+1)+' : état invalide');items(s.plan,'séance '+(i+1))});
 o.logs.forEach((l,i)=>{if(!l||!str(l.id)||!str(l.e))return push('série '+(i+1)+' : identifiant ou exercice manquant');if(!sids.has(l.sid))push('série '+(i+1)+' : séance introuvable');
  if(!F(l.kg)||l.kg<0||l.kg>1000)push('série '+(i+1)+' : charge invalide');if(!F(l.r)||l.r<=0||l.r>10000)push('série '+(i+1)+' : nombre invalide');
  if(!F(l.t)||l.t<946684800000||l.t>Date.now()+2*864e5)push('série '+(i+1)+' : date invalide');if(l.f!=null&&!FEEL[l.f])push('série '+(i+1)+' : ressenti inconnu');
  if(l.lt!=null&&!LTL[l.lt])push('série '+(i+1)+' : type de charge inconnu');if(l.un!=null&&!UL[l.un])push('série '+(i+1)+' : unité inconnue');
  if(l.dr!=null&&(!Array.isArray(l.dr)||l.dr.some(d=>!d||!F(d.kg)||d.kg<0||d.kg>1000||!F(d.r)||d.r<=0||d.r>1000)))push('série '+(i+1)+' : dégressif invalide')});
 o.progs.forEach((p,i)=>{if(!p||!str(p.id)||typeof p.n!=='string')push('programme '+(i+1)+' invalide');else items(p.items,'programme « '+p.n+' »')});
 o.ex.forEach((e,i)=>{if(!e||!str(e.id)||!str(e.n)||!Array.isArray(e.m)||!e.m.every(m=>typeof m==='string'))push('exercice '+(i+1)+' invalide');else{if(e.lt!=null&&!LTL[e.lt])push(e.n+' : type de charge inconnu');if(e.unit!=null&&!UL[e.unit])push(e.n+' : unité inconnue');if(e.inc!=null&&!(F(e.inc)&&e.inc>0&&e.inc<=50))push(e.n+' : incrément invalide')}});
 o.food.forEach((f,i)=>{if(!f||!str(f.id)||!D.test(f.d)||typeof f.n!=='string'||!(F(f.q)&&f.q>0&&f.q<=5000)||!['k','p','g','l'].every(k=>F(f[k])&&f[k]>=0))push('aliment '+(i+1)+' invalide')});
 o.bw.forEach((b,i)=>{if(!b||!D.test(b.d)||!F(b.kg)||b.kg<20||b.kg>400)push('pesée '+(i+1)+' invalide')});
 o.meas.forEach((m,i)=>{if(!m||!D.test(m.d)||MEAS.some(([k])=>m[k]!=null&&!(F(m[k])&&m[k]>=5&&m[k]<=300)))push('mesure '+(i+1)+' invalide')});
 o.myfoods.forEach((f,i)=>{if(!f||typeof f.n!=='string'||!F(f.k100))push('produit '+(i+1)+' invalide')});
 Object.entries(o.water||{}).forEach(([d,x])=>{if(!D.test(d)||!x||!F(x.n)||x.n<0||x.n>60)push('eau du '+d+' invalide')});
 const p=o.prof;if(!p||typeof p!=='object')push('profil absent');else{[['a',[10,120]],['h',[100,250]],['w',[20,400]],['sess',[1,14]],['rest',[10,900]],['step',[.1,50]]].forEach(([k,r])=>{if(p[k]!=null&&!inR(p[k],r))push('profil : '+k+' invalide')});if(p.goal&&!['masse','maintien','seche'].includes(p.goal))push('profil : objectif inconnu')}
 return E}
/* raw file → checked, migrated, validated copy (throws a list of reasons; never touches S) */
function prepareImport(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw ['ce n’est pas une sauvegarde Charge'];
 if(!Array.isArray(raw.logs))throw ['séries absentes : ce n’est pas une sauvegarde Charge'];
 if(raw.day!=null&&(typeof raw.day!=='object'||(raw.day.extra!=null&&(!Array.isArray(raw.day.extra)||raw.day.extra.some(x=>typeof x!=='string')))||(raw.day.swap!=null&&(typeof raw.day.swap!=='object'||Object.values(raw.day.swap).some(x=>typeof x!=='string')))))throw ['journée en cours (day) invalide'];
 if(raw.logs.some(l=>!l||typeof l.t!=='number'||!isFinite(l.t)))throw ['une série n’a pas de date valide'];
 /* the raw file is checked before migration, so nothing invalid is silently "repaired" */
 const F=v=>typeof v==='number'&&isFinite(v),I=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,E=[];
 const rawItems=(L,w)=>{if(L==null)return;if(!Array.isArray(L))return E.push(w+' : liste invalide');L.forEach((x,i)=>{const r=x?.rmin??x?.r;
  if(!x||typeof x.id!=='string'||!x.id)E.push(w+', exercice '+(i+1)+' : identifiant manquant');else if(!I(x.s,1,20))E.push(w+', '+x.id+' : nombre de séries invalide ('+x.s+')');
  else if(!I(r,1,10000)||(x.rmax!=null&&!I(x.rmax,r,10000)))E.push(w+', '+x.id+' : répétitions invalides');else if(x.rest!=null&&!(F(x.rest)&&x.rest>=10&&x.rest<=900))E.push(w+', '+x.id+' : repos invalide')})};
 if(raw.progs!=null&&!Array.isArray(raw.progs))E.push('programmes invalides');else (raw.progs||[]).forEach((p,i)=>{if(!p||typeof p.id!=='string')E.push('programme '+(i+1)+' invalide');else rawItems(p.items,'programme « '+(p.n||p.id)+' »')});
 if(raw.sess!=null){if(!Array.isArray(raw.sess))E.push('séances invalides');else raw.sess.forEach((s,i)=>rawItems(s?.plan,'séance '+(i+1)))}
 raw.logs.forEach((l,i)=>{if(E.length>6)return;if(typeof l.e!=='string'||!l.e)E.push('série '+(i+1)+' : exercice manquant');else if(!F(l.kg)||l.kg<0||l.kg>1000)E.push('série '+(i+1)+' : charge invalide');else if(!F(l.r)||l.r<=0||l.r>10000)E.push('série '+(i+1)+' : nombre invalide')});
 if(E.length)throw E.slice(0,6);
 let M;try{M=migrate(raw)}catch(e){throw ['migration impossible']}const V=validate(M);if(V.length)throw V;return M}

/* ---------- merge two copies (this device + account, or two tabs) ----------
   Union by id. Higher version wins; then later time; then a fixed order, so every device reaches the same result.
   A deletion wins over every version it has seen. Open sessions are never closed by a merge. */
const COLL={logs:l=>l.id,sess:s=>s.id,food:f=>f.id,bw:b=>b.d,meas:m=>m.d,myfoods:f=>f.code?'c'+f.code:'n'+f.n,tmeals:t=>t.id,progs:p=>p.id,ex:e=>e.id};
const MAPS=['water','goalsEx','badges'],META=['prof','pn','cur','fav'];
/* JSON with sorted keys: two copies that hold the same data compare equal whatever the order their fields were written in */
const canon=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((r,x)=>(r[x]=v[x],r),{}):v);
const newer=(x,o)=>{const a=x?.ver||0,b=o?.ver||0;if(a!==b)return a>b;const c=x?.u||0,d=o?.u||0;if(c!==d)return c>d;return canon(x)>canon(o)};
const gone=(d,x)=>!!d&&(typeof d==='number'?d>=(x?.u||0):(d.v||0)>=(x?.ver||0));
const tombMax=(a,b)=>{if(!a)return b;if(!b)return a;if(typeof a==='object'&&typeof b==='object')return (b.v||0)>(a.v||0)?b:a;if(typeof a==='object')return a;if(typeof b==='object')return b;return Math.max(a,b)};
function merge(A,B){const O=structuredClone(A),del={...(A.del||{})};Object.entries(B.del||{}).forEach(([k,d])=>{del[k]=tombMax(del[k],d)});
 for(const [c,f] of Object.entries(COLL)){const M=new Map();for(const x of [...(B[c]||[]),...(A[c]||[])]){const k=f(x),o=M.get(k);if(!o||newer(x,o))M.set(k,x)}
  O[c]=[...M.values()].filter(x=>!gone(del[c+':'+f(x)],x)).map(x=>structuredClone(x))}
 for(const m of MAPS){const R={};for(const src of [B[m]||{},A[m]||{}])Object.entries(src).forEach(([k,x])=>{if(!R[k]||newer(x,R[k]))R[k]=x});
  Object.keys(R).forEach(k=>{if(gone(del[m+':'+k],R[k]))delete R[k]});O[m]=structuredClone(R)}
 O.wkGoal={...(B.wkGoal||{}),...(A.wkGoal||{})};
 O.mt={...(A.mt||{})};for(const f of META){const a=A.mt?.[f]||0,b=B.mt?.[f]||0;if(b>a||(b===a&&b&&canon(B[f])>canon(A[f]))){O[f]=structuredClone(B[f]);O.mt[f]=b}}
 const ids=new Set(O.sess.map(s=>s.id));O.logs=O.logs.filter(l=>ids.has(l.sid)).sort((a,b)=>a.t-b.t);
 O.del=del;O.v=5;return O}
const sameData=(A,B)=>canon(A)===canon(B);
const missingFrom=(R,L)=>Object.entries(COLL).some(([c,f])=>{const K=new Set((R[c]||[]).map(f));return (L[c]||[]).some(x=>!K.has(f(x)))});

/* ---------- start: read, migrate after a confirmed backup, or stop on unreadable data ---------- */
let migWarn='';
async function boot(){let j=null;try{j=localStorage.getItem('charge')}catch(e){localErr='stockage refusé';return}
 if(!j)return;let o=null;try{o=JSON.parse(j)}catch(e){}
 if(!o||typeof o!=='object'){const w=await backup('Données illisibles (copie brute)',j);BAD={raw:j,why:'Les données de cet appareil sont illisibles.',copy:w};return}
 let M;try{M=migrate(o)}catch(e){const w=await backup('Migration impossible (copie brute)',j);BAD={raw:j,why:'Les données de cet appareil n’ont pas pu être converties.',copy:w};return}
 const E=validate(M);if(E.length){await backup('Données incohérentes',j);console.warn(E)}
 if((o.v||1)<5){const w=await backup('Avant mise à jour '+APPV,j);if(!w)migWarn='La mise à jour a été faite sans copie de l’ancienne version (stockage plein ?). Exporte tes données.'}
 S=M;if((o.v||1)<5)persistLocal()}
/* a rescue copy (made when localStorage refused a save) is merged back at start */
async function loadRescue(){if(BAD)return;try{const r=await IDB.get('rescue','cur');if(!r)return;const R=fromJSON(r.json),M=merge(S,R);if(!sameData(M,S)){S=M;REV++;if(persistLocal())await IDB.del('rescue','cur');render()}else if(!localErr)await IDB.del('rescue','cur')}catch(e){}}
/* another tab saved: merge, and write the merged result if it holds something the other tab did not have */
window.addEventListener('storage',e=>{if(BAD||e.key!=='charge'||!e.newValue)return;try{const R=fromJSON(e.newValue),M=merge(S,R);if(!sameData(M,S)){S=M;REV++;softRender()}if(!sameData(S,R)&&missingFrom(R,S))persistLocal()}catch(err){}});

/* ---------- account copy (only inside Claude): short write lock → read → merge → write → check ---------- */
async function cloud(){if(!window.claude||BAD)return;try{const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);const id=user&&await user.id();if(!db||!id)return;
 dbDoc=db.doc('data/users/'+id+'/app');lockDoc=db.doc('data/users/'+id+'/lock');sync='chargement';await pushCloud();if(!S.prof.onb&&S.logs.length)S.prof.onb=1;softRender()}catch(e){sync='local';banner()}}
async function pushCloud(){if(!dbDoc||BAD)return;if(pushing){pushAgain=true;return}pushing=true;sync='envoi';
 try{if(lockDoc&&typeof lockDoc.acquire==='function'){const L=await lockDoc.acquire({holder:DEV,ttlMs:15000}).catch(()=>({acquired:true}));
   if(!L.acquired){pushing=false;clearTimeout(pushT);pushT=setTimeout(pushCloud,1500+Math.random()*2000);return}}
  for(let round=0;round<3;round++){const snap=await dbDoc.get();let R=null;
   if(snap.exists){const j=snap.data().json;try{R=fromJSON(j)}catch(e){await backup('Copie du compte illisible',j)}}
   if(R){const M=merge(S,R);if(!sameData(M,S)){S=M;REV++;persistLocal();softRender()}if(sameData(S,R)){sync='cloud';pushTry=0;return}}
   await dbDoc.set({json:JSON.stringify(S)});
   /* check that nothing written by another device in between was lost; otherwise merge again */
   const chk=await dbDoc.get(),C=chk.exists?fromJSON(chk.data().json):null;if(C&&!missingFrom(C,S)){if(!sameData(merge(S,C),S)){S=merge(S,C);REV++;persistLocal();softRender();continue}sync='cloud';pushTry=0;return}}
  sync='cloud';pushTry=0}
 catch(e){sync='erreur';pushTry++;clearTimeout(pushT);pushT=setTimeout(pushCloud,[3,10,30,60,120][Math.min(4,pushTry-1)]*1000)}
 finally{pushing=false;banner();if(pushAgain){pushAgain=false;clearTimeout(pushT);pushT=setTimeout(pushCloud,300)}}}
/* ---------- Google account (standalone site only): the data lives in the user's own Google Drive, in the hidden folder reserved to this app.
   No server: Google Identity Services gives a 1-hour token (scope drive.appdata = only this app's own files), then read → merge → write → check. ---------- */
const GCLIENT='867365199367-m30smjr584p94v4qk25p97tmco8sl6st.apps.googleusercontent.com';/* OAuth client ID (Google Cloud console, type "Web application", authorised origin = the site address) */
const gcid=()=>{try{return GCLIENT||localStorage.getItem('charge-gcid')||''}catch(e){return GCLIENT}};
let G={tok:'',exp:0,state:'off',err:'',busy:false,again:false,timer:0};/* off | idle | sync | ok | err */
let GS={};try{GS=JSON.parse(localStorage.getItem('charge-g')||'{}')||{}}catch(e){}
const gSaveMeta=()=>{try{localStorage.setItem('charge-g',JSON.stringify(GS))}catch(e){}};
const gOn=()=>!!GS.on&&!window.claude;
const gLive=()=>G.tok&&Date.now()<G.exp-60000;
const gPending=()=>gOn()&&(GS.last||0)<lastSaved;
let gisP=null;
function loadGIS(){if(window.google?.accounts?.oauth2)return Promise.resolve();if(gisP)return gisP;
 gisP=new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=()=>ok();s.onerror=()=>{gisP=null;s.remove();ko(new Error('gis'))};document.head.appendChild(s)});return gisP}
/* must be called from a tap (the browser only allows Google's window after a user gesture) */
async function gConnect(){const id=gcid();if(!id){G.state='err';G.err='Connexion Google pas encore configurée.';return softRender()}
 G.state='sync';G.err='';softRender();
 try{await loadGIS()}catch(e){G.state='err';G.err='Impossible de joindre Google (réseau ?).';return softRender()}
 const tc=google.accounts.oauth2.initTokenClient({client_id:id,scope:'https://www.googleapis.com/auth/drive.appdata openid email',
  ...(GS.email?{login_hint:GS.email}:{}),
  callback:async r=>{if(r.error){G.state='err';G.err=r.error==='access_denied'?'Accès refusé.':'Connexion Google échouée.';return softRender()}
   G.tok=r.access_token;G.exp=Date.now()+(r.expires_in||3600)*1000;
   if(!GS.email){try{const u=await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+G.tok}})).json();GS.email=u.email||''}catch(e){}}
   GS.on=1;gSaveMeta();gSync()},
  error_callback:e=>{G.state=G.tok?'idle':'err';G.err=e?.type==='popup_closed'?'Fenêtre Google fermée.':e?.type==='popup_failed_to_open'?'Fenêtre Google bloquée par le navigateur.':'Connexion Google échouée.';softRender()}});
 tc.requestAccessToken({prompt:GS.on?'':'consent'})}
async function gApi(url,opt={}){const r=await fetch(url,{...opt,headers:{...(opt.headers||{}),Authorization:'Bearer '+G.tok}});
 if(r.status===401){G.tok='';G.exp=0;throw new Error('auth')}if(!r.ok)throw new Error('http '+r.status);return r}
async function gFind(){const q=encodeURIComponent("name='charge.json' and trashed=false");
 const j=await (await gApi(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`)).json();return j.files?.[0]?.id||null}
async function gRead(id){return await (await gApi(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`,{cache:'no-store'})).text()}
async function gWrite(id,json){if(id){await gApi(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:json});return id}
 const b='charge'+uid(),body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:'charge.json',parents:['appDataFolder']})}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${json}\r\n--${b}--`;
 const j=await (await gApi('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body})).json();return j.id}
async function gSync(){if(!gOn()||BAD)return;if(!gLive()){G.state='idle';return softRender()}if(G.busy){G.again=true;return}G.busy=true;G.state='sync';softRender();
 try{let id=await gFind();{const N=merge(S,S);if(!sameData(N,S)){S=N;REV++}}/* same shape as a merged copy, so the check below does not cause a second upload */
  for(let round=0;round<3;round++){let R=null;if(id){const j=await gRead(id);try{R=fromJSON(j)}catch(e){await backup('Copie Google Drive illisible',j)}}
   if(R){const M=merge(S,R);if(!sameData(M,S)){S=M;REV++;persistLocal();softRender()}if(sameData(S,R))break}
   id=await gWrite(id,JSON.stringify(S));
   const C=fromJSON(await gRead(id));if(!missingFrom(C,S)&&sameData(merge(S,C),S))break;S=merge(S,C);REV++;persistLocal()}
  GS.last=Date.now();gSaveMeta();G.state='ok';G.err=''}
 catch(e){G.state=e.message==='auth'?'idle':'err';G.err=e.message==='auth'?'':'Synchronisation Google échouée, nouvel essai à la prochaine modification.'}
 finally{G.busy=false;banner();softRender();if(G.again){G.again=false;setTimeout(gSync,300)}}}
function gOff(){try{if(G.tok&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(G.tok,()=>{})}catch(e){}G={tok:'',exp:0,state:'off',err:'',busy:false,again:false,timer:0};GS={};gSaveMeta()}
let dl=null,sample=null,sampleImg=false;
async function initCaps(){if(!window.claude)return;
 try{dl=await claude.use('downloads')}catch(e){dl=null}
 try{sample=await claude.use('sample');if(sample){const lim=await sample.limits().catch(()=>null);sampleImg=!!lim?.images}}catch(e){sample=null}
 softRender()}
/* ask the browser to keep this site's storage (Safari otherwise may clear it after 7 days without use, unless the app is on the home screen) */
async function askPersist(){try{if(navigator.storage?.persisted){persisted=await navigator.storage.persisted();if(!persisted&&navigator.storage.persist)persisted=await navigator.storage.persist()}}catch(e){persisted=null}}
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;

/* ---------- progress photos stay on this device (IndexedDB), never in the synced data ---------- */
const PH={urls:{},all:()=>IDB.all('p').then(L=>L.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:a.t-b.t)),put:o=>IDB.put('p',o),del:id=>IDB.del('p',id),
 url(p){return this.urls[p.id]||(this.urls[p.id]=URL.createObjectURL(p.blob))}};
let photos=null;
async function loadPhotos(){try{photos=await PH.all()}catch(e){photos=false}if(tab==='corps'&&view.ct==='photos'&&!$('#ov').innerHTML)render()}
function shrink(file,max=1100){return new Promise((ok,ko)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?ok(b):ko(new Error('blob')),'image/jpeg',.82)};im.onerror=()=>{URL.revokeObjectURL(u);ko(new Error('image'))};im.src=u})}

/* ================= feedback ================= */
let toastT;
function toast(msg,act){$('#toast').innerHTML=`<div class="toast" role="status"><span>${msg}</span>${act?`<button data-a="${act[0]}" data-v="${esc(act[2]??'')}">${act[1]}</button>`:''}</div>`;
 clearTimeout(toastT);toastT=setTimeout(()=>$('#toast').innerHTML='',act?7000:4500)}
let actx=null;
function primeAudio(){if(!S.prof.sound)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume()}catch(e){}}
function fanfare(){try{navigator.vibrate&&navigator.vibrate([60,40,60,40,160])}catch(e){}if(!actx||!S.prof.sound)return;try{[523,659,784,1047].forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(actx.destination);const t=actx.currentTime+i*.11;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+(i===3?.5:.12));o.start(t);o.stop(t+.55)})}catch(e){}}
function beep(){try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}if(!actx||!S.prof.sound)return;try{[0,.18,.36].forEach((d,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=i===2?1320:880;o.connect(g);g.connect(actx.destination);
 const t=actx.currentTime+d;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.25,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.start(t);o.stop(t+.16)})}catch(e){}}
let wake=null;function keepAwake(){if(wake||!navigator.wakeLock)return;navigator.wakeLock.request('screen').then(w=>{wake=w;w.addEventListener('release',()=>wake=null)}).catch(()=>{})}

/* ================= icons (stroke, follow text colour) ================= */
const I={seance:'<path d="M3 10v4M7 7v10M17 7v10M21 10v4M7 12h10"/>',prog:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',corps:'<circle cx="12" cy="4.5" r="2.5"/><path d="M5 9h14M12 9v6M12 15l-3 6M12 15l3 6"/>',
 nut:'<path d="M12 21c-4 0-7-3-7-8 0-3 2-5 4-5 1.2 0 2 .6 3 .6s1.8-.6 3-.6c2 0 4 2 4 5 0 5-3 8-7 8zM12 8c0-2 1-4 3-5"/>',prof:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
 check:'<path d="M5 12l5 5 9-10"/>',back:'<path d="M15 5l-7 7 7 7"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',chev:'<path d="M9 5l7 7-7 7"/>',left:'<path d="M15 5l-7 7 7 7"/>',scan:'<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M7 8v8M10 8v8M13 8v8M16 8v8"/>',
 star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
 swap:'<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',water:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
 undo:'<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>'};
const ic=(n,s=22)=>`<svg class="i" style="width:${s}px;height:${s}px" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
</script>
