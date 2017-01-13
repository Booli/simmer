/*

NOTE: This code is from draftsim.com! All credits go to the creator of draftsim.com! I wanted to build a more comprehensive sealed deck tool and took his/hers work as starting point.

This file contains all of the drafting logic and display properties
It is grouped into a series of sections
  1. Visbility of buttons
  2. Variable Defintions
  3. Drafting functions and commitent to colors
  4. Deckbuilding and sorting
  5. List of draft sets 
*/

//Global variables
 var draft = "...";
 var PACK_SIZE=14;  //Cards in pack
 var RATING_THRESH=2.0;  //Baseline playability rating for color_commit
 var COLOR_COMMIT_THRESHOLD=3.5;  //Determines how many good cards are needed to commit to a color
 var TIME_TO_COMMIT=1*PACK_SIZE+3; //Always commit to colors by pack 2 pick 4
 var MAX_BONUS_SPEC=.9;  //The maximum bonus during the speculation phase at the start of a draft
 var ON_COLOR_BONUS=2.0; //Bonus cards receive after player locks into 2 colors
 var OFF_COLOR_PENALTY=1.0; //Penalty for off color cards after the player locks into 2 colors
 var SING_COLOR_BIAS_FACTOR=2.0; //If the player only has cards of 1 color, reduce the bonus by this fraction
 var SECOND_COLOR_FRAC=0.8; //When committed to one color, the second color bonus is this fraction of the on color bonus
 var MULTICOLOR_PENALTY=0.6; //P1P1 penalty for multicolored cards 

//Shows buttons that are visible at the start of the draft 
function draft_start_visibility(){
  var display_element = document.getElementsByClassName('during_draft'), i;
  for (i = 0; i < display_element.length; i += 1) {
    display_element[i].style.display = 'inline';
  }
  document.getElementById('pack_box').style.display = 'block'; //pack_box needs block formatting
  document.getElementById("bot_decks_button").innerHTML="View Bots"; //special case    
  var display_element = document.getElementsByClassName('after_draft'), i;
  for (i = 0; i < display_element.length; i += 1) {
    display_element[i].style.display = 'none';
  }
  return;
}

//Shows buttons that are visible at the end of the draft
function draft_end_visibility(){
  var display_element = document.getElementsByClassName('during_draft'), i;
  for (i = 0; i < display_element.length; i += 1) {
    display_element[i].style.display = 'none';
  }
  var display_element = document.getElementsByClassName('after_draft'), i;
  for (i = 0; i < display_element.length; i += 1) {
    display_element[i].style.display = 'inline';
  }
  if (num_players<=1){
    document.getElementById('bot_decks_button').style.display='none';
  }
  return;
}

//Toggles between showing and hiding bot decks
function toggle_bot_deck_visibility(){
  if(show_bot_decks==0){
    show_bot_decks=1;
    var target = document.getElementById('bot_collection_img');
    target.scrollIntoView(true);
    document.getElementById("bot_decks_button").innerHTML="Hide Bots";
  } else {
    show_bot_decks=0;
    document.getElementById("bot_decks_button").innerHTML="View Bots";
  }
  Print_collection();
  return;
}

//Show or hide the suggestion panel
function toggle_suggestions(){
  var display_element = document.getElementById('pack_text_container'), i;
  if(display_element.style.display == 'none'){
    display_element.style.display = 'inline';
    display_element.style.minHeight= '200px';
  } else {
    display_element.style.display= 'none';
    display_element.style.minHeight= '0px';
  }
  return;
}

//Adds land to deck. Doesn't call Print_collection()
function addLand(pn, land_num){ 
  
  //Decks can't have more than this many lands. Exists to limit the number of cards on the screen
  var MAX_LANDS=40;
  if(draft.players[pn].basiclands.length<MAX_LANDS){
    draft.players[pn].basiclands.push(LANDS[land_num]);
  }

  //When the deck is 40 cards, sort it
  var total_cards=draft.players[pn].deck.length+draft.players[pn].basiclands.length;
  if (total_cards==40){
    draft.players[pn].deck= sortByMultiple ( draft.players[pn].deck, ["creaturesort", "cmc", "name"]);
  }

  //update the deck_text
  if(pn==0){
    deck_text();
  }
return;
}


//Create a pack of cards for the listed set
function Pack(card_list){

  //The pack contents contain cards
  this.pack_contents=[];
  
  //This section lists the number of cards of each rarity and color
  var common=0;
  var uncommon=0;
  var rare=0;
  var mythic=0;
  var common_colors=[0,0,0,0,0,0,0]; //WUBRG, artifacts, multi

  //Number of cards in the set
  var cards_in_set=card_list.length

  //Select whether a mythic or rare is in the pack
  mythic_roll=Math.floor((Math.random() * 121) + 1);
  if (mythic_roll>15){
    mythic=1;
  } else {
    rare=1;
  }
  
  //Add cards to the pack without duplication
  //Iteration counter prevents infinite loops
  var its=0; max_its=10000;
  while(this.pack_contents.length<PACK_SIZE && its<max_its){
    its=its+1;
    
    //Choose a random card in the current set
    var card_roll=Math.floor((Math.random() * cards_in_set));
    var new_card = card_list[card_roll];
    
    //Check if card in pack contents
    var card_in_pack=0;
    if (this.pack_contents.length>0){
      for (var i = 0; i < this.pack_contents.length; i++) {
        if ( new_card.name==this.pack_contents[i].name){
          card_in_pack=1;
        }
      }
    }
    
    //No more than 3 commons of any one color
    too_many=0;
    var color_index = parseInt( card_list[card_roll].colorsort );
    if (color_index < 5 && common_colors[color_index] > 2 && its<max_its/2){
      too_many=1;
    }
    
    //Count number of unused colors
    num_zeros=0;
    for (var i=0; i<5; i++){
      if (common_colors[i]==0){
        num_zeros=num_zeros+1;
      }
    }
    
    //cards remaining (including this one)
    num_cards_to_add = PACK_SIZE - this.pack_contents.length;
    
    //Reroll if needed to ensure at least 1 common of each color in pack
    num_cards_to_add = PACK_SIZE - this.pack_contents.length;
    if (num_cards_to_add<=num_zeros && ( (common_colors[color_index]!==0) ||
       (color_index>4) ) && (its<(max_its/2)) ) {
      too_many=1;
    }
    
    //Determine card rarity and add new card to pack if possible, in rarity order
    rarity_nc=new_card.rarity
    if (card_in_pack<1 && too_many<1){
      if (rarity_nc=="M" && mythic < 1){
        this.pack_contents.push(card_list[card_roll]);
        mythic=mythic+1; 
      } else if (rarity_nc=="R" && rare < 1 && mythic==1){
        this.pack_contents.push(card_list[card_roll]);
        rare=rare+1;
      } else if (rarity_nc=="U" && uncommon < 3 && rare==1 && mythic==1){
        this.pack_contents.push(card_list[card_roll]);
        uncommon=uncommon+1;
      } else if (rarity_nc=="C" && common < PACK_SIZE-4 && uncommon==3){
        this.pack_contents.push(card_list[card_roll]);
        var color_index = parseInt( card_list[card_roll].colorsort );
        common_colors[color_index] = common_colors[color_index] + 1 ;
        common=common+1;
      }
    }    
  }

  //FRF - remove last common and add land
  if(card_list[0].name=="Citadel_Siege"){
    this.pack_contents.splice(PACK_SIZE-1,1);
    var land_roll = Math.floor((Math.random() * 10));
    this.pack_contents.push(FRF_lands[land_roll]);
  }
  
  //KLD - 1/144 chance of removing last common and adding invention
  if(card_list[0].name=="Acrobatic_Maneuver"){
    var inc_inv_roll = Math.floor(Math.random()*144)
    if (inc_inv_roll == 0){
      this.pack_contents.splice(PACK_SIZE-1,1);
      var invention_roll = Math.floor((Math.random() * 30));
      this.pack_contents.push(KLD_inventions[invention_roll]);
    }
  }

    //AER - 1/144 chance of removing last common and adding invention
  if(card_list[0].name=="Aerial_Modification"){
    var inc_inv_roll = Math.floor(Math.random()*144)
    if (inc_inv_roll == 0){
      this.pack_contents.splice(PACK_SIZE-1,1);
      var invention_roll = Math.floor((Math.random() * 24));
      this.pack_contents.push(AER_inventions[invention_roll]);
    }
  }
 
  //SOI/EMN - add flip card
  var flip_card_set=0;
  if(card_list[0].name=="Aim_High"){
    flip_card_set=1; //SOI
  }
  if(card_list[0].name=="Blessed_Alliance"){
    flip_card_set=2; //EMN
  }

  //if we need flip cards
  if(flip_card_set>0){
    //remove the last common
    this.pack_contents.splice(PACK_SIZE-1,1);
    
    //Determine if we need to add a rare/mythic
    var flip_rare=0;
    var rare_roll=Math.floor((Math.random() * 8));
    if (rare_roll==1){
      flip_rare=1;
      //remove another common
      this.pack_contents.splice(PACK_SIZE-2,1);
    }

    //SOI set file organized as 4 commons, 20 uncommons, 6 rares, and 3 mythics
    //EMN set file has          4 commons, 10 uncommons, 5 rares, and 2 mythics
    var num_com_uncom=2;
    if (flip_card_set==1){
       num_com_uncom=24; //SOI
       num_rare_myth=9;
    } else if (flip_card_set==2){
       num_com_uncom=14; //EMN
       num_rare_myth=7;
    }

    //Add a common/uncommon, reroll uncommons 3/5 of the time
    var converged=0;
      while(converged==0){
      var com_flip_roll=Math.floor((Math.random() * num_com_uncom));
        var reroll_uncommons=Math.floor((Math.random() * 5)); //reroll if > 1
          if (com_flip_roll<4){ //if we have a common
            converged=1;
    } else if (reroll_uncommons<2){
      converged=1;
    }
      }      
    if(flip_card_set==1){
      this.pack_contents.push(SOI_flip[com_flip_roll]);
    } else if (flip_card_set==2){
      this.pack_contents.push(EMN_flip[com_flip_roll]);
    }

    //Add a rare if needed
    if (flip_rare==1){
      
      //Add a rare/mythic, reroll rares 1/2 of the time
      var converged=0;
        while(converged==0){
        var rare_flip_card=Math.floor((Math.random() * num_rare_myth))+num_com_uncom;
          var reroll_mythics=Math.floor((Math.random() * 2 )); //reroll if == 1
            if (rare_flip_card<30){
              converged=1;
      } else if (reroll_mythics==0){
        converged=1;
      }
        }
      //add the rare
      if (flip_card_set==1){
        this.pack_contents.push(SOI_flip[rare_flip_card]);
      } else if (flip_card_set==2) {
        this.pack_contents.push(EMN_flip[rare_flip_card]);
      }
    }
  }
  return;
}

//Sorts a sequence by a series of keys
//USAGE:    var sorted = sortByMultiple(patients, ["roomNumber", "name"]);
function sortByMultiple(sequence, keys) {
  var copy = copySequence(sequence);
  copy.sort(function(x, y) {
    var comparison = 0;
    for (var i = 0; i < keys.length; ++i) {
      comparison = compareBy(x, y, keys[i]);
      if (comparison !== 0) {
        return comparison;
      }
    }
    return comparison;
  });
  return copy;
}

//General comparision of x and y for sorting
function compareBy(x, y, key) {
  if (x[key] === y[key]) {
    return 0;
  }
  return x[key] > y[key] ? 1 : -1;
}

//Copy a sequence. Needed for sorting function
function copySequence(sequence) {
  var copy = [];
  for (var i = 0; i < sequence.length; ++i) {
    copy.push(sequence[i]);
  }
  return copy;
}


//Creates a new draft and gives each player 3 packs
function Draft(s1, s2, s3, n_players){

  //Create an array of players
  num_players=n_players;
  this.players=[];
  this.set1=s1;
  this.set2=s2;
  this.set3=s3;
  this.num_nonlands=23;
  
  //Play 18 lands in BFZ drafts
  if (s1==BFZ){
    this.num_nonlands=22;
  }

  //Add the players to the draft
  for (i = 0; i < num_players; i++) {
    var pack_i=new Pack(this.set1);
    var drafter_i= {pack:pack_i,collection:[], deck:[], basiclands:[], color_commit:[0,0,0,0,0],in_color:[1,1,1,1,1]};
    this.players.push(drafter_i);
  }
  return;
} 

/*Determines which colors are on-color as a 5 element list
On color is defined as:
  1. The player's commitment to that color > COLOR_COMMIT_THRESHOLD
  2. If more than two colors qualify, choose the two with the largest commitment */
function update_in_color(p_index){ 

  //Reset the in_color list
  draft.players[p_index].in_color=[0,0,0,0,0];

  //Create a copy of the color commit list
  var temp_color_commit=[0,0,0,0,0];
  for (k=0;k<5;k++){
    temp_color_commit[k]=draft.players[p_index].color_commit[k];
  }
  
  //Find the maximum value of color_commit
  max_index=0;
  second_index=0;
  max_value=temp_color_commit[0];
  for(k=1;k<5;k++){
    var cur_commit=temp_color_commit[k];
    if (cur_commit>max_value){
      max_index=k;
      max_value=cur_commit;
    }
  }
  
  //If the player is commited to at least 1 color
  if (max_value>COLOR_COMMIT_THRESHOLD){
    
    //Mark the maximum as in_color
    draft.players[p_index].in_color[max_index]=1;  
    
    //find the second_max value
    temp_color_commit[max_index]=-10;
    second_index=0;
    second_value=temp_color_commit[0];
    for(k=1;k<5;k++){
      var cur_commit=temp_color_commit[k];
      if (cur_commit>second_value){
    second_index=k;
        second_value=cur_commit;
      }
    }

    //If the second maximum qualifies, mark it as in_color
    if (second_value>COLOR_COMMIT_THRESHOLD) {
      draft.players[p_index].in_color[second_index]=1;
    } 

  } else {
    
    //If no color is above the threshold, The player is not committed to no colors
    draft.players[p_index].in_color=[0,0,0,0,0];
  }

  //Late in the draft, after TIME_TO_COMMIT cards are picked, commit to two colors 
  total_cards=draft.players[p_index].deck.length+draft.players[p_index].collection.length
  if(total_cards>TIME_TO_COMMIT){
     draft.players[p_index].in_color[max_index]=1;     
     draft.players[p_index].in_color[second_index]=1;
  }

  //Return indices of top colors
  top_colors = [max_index, second_index];  
  return top_colors;
}


//Updates the bias function for the current pack
function update_bias_pack(player_i){

  //update which cards on are color
  top_colors=update_in_color(player_i);
  pack_length=draft.players[player_i].pack.pack_contents.length;
  
  //figure out how many colors the player is commited to
  player_colors=0;
  for (var j=0; j<5; j++){
    if(draft.players[player_i].color_commit[j]>COLOR_COMMIT_THRESHOLD){
      player_colors=player_colors+1;
    } 
  }

  //For each card in the pack
  for (i = 0; i < pack_length; i++) {
    
    //Grab the card
    this_card=draft.players[player_i].pack.pack_contents[i];
    cur_bias=0;
    
    //Check if card is on color
    var on_color_card=1;
    var off_color_amount=0;
    for (xx=0; xx<5;xx++){
      if(this_card.colors[xx] > 0 && draft.players[player_i].in_color[xx]==0){
        on_color_card=0;
        off_color_amount+=this_card.colors[xx];
      }
    }  

    //Check number of colors
    var num_colors=0;
      for (var kk=0;kk<5;kk++){
        if (draft.players[player_i].in_color[kk]==1){
          num_colors+=1;
      }
    }
    
    /*Multiplicative factor that sets the maximum bonus during
    the speculation phase to MAX_BONUS_SPEC */
    denom=COLOR_COMMIT_THRESHOLD / MAX_BONUS_SPEC; 
    
     //First, handle committed to 2 colors case
     if(num_colors==2){
       if (on_color_card==1){
         cur_bias=ON_COLOR_BONUS;
       } else {
         cur_bias=-1.0*OFF_COLOR_PENALTY*(off_color_amount-1); //Penalty for off color cards
       }
     } else {      
       /* Compute the cards bonus, cur_bias, as a function of how many colors the card is
         1. 0 colors - bonus equal to the highest bonus of a color
         2. 1 color
            a. If player is committed to zero colors, use bias for those colors
            b. If player is committed to one color, the biases for the top two colors
               are MAX_BONUS_SPEC and SECOND_COLOR_FRAC*MAX_BONUS_SPEC, respectively
         4. 2-3 colors - For a RW card, use commit(RW)-commit(UBG)-MULTICOLOR_BIAS
         5. 4-5 colors - no bonuses*/
       
       //Get the number of colors of the card
       cur_bias=-.2; //Dummy initialization
       var num_card_colors=0;
       for (var ii=0; ii<5; ii++){
         if (this_card.colors[ii]>0){
     num_card_colors+=1;
         }
       }

       //Check the number of colors the player has cards in
       num_player_colors=0;
       for (var kk=0;kk<5;kk++){
         if (draft.players[player_i].color_commit[kk]>0){
           num_player_colors+=1;
         }
       }
     
       //Case 1: A 0-colored card
       if (num_card_colors==0){
      
         //Get maximum color commitment
         max_value=draft.players[player_i].color_commit[0];
         for(var k=1;k<5;k++){
           var cur_commit=draft.players[player_i].color_commit[k];
           if (cur_commit>max_value){
             max_value=cur_commit;
           }
         }
         
         //Set current bias to maximum current bias
       if (num_player_colors>1){   
           cur_bias = Math.min(COLOR_COMMIT_THRESHOLD/(1.0*denom), max_value/(1.0*denom));
         } else {
           cur_bias=0;
       }
       }

       //Case 2: A 1-colored card
       if (num_card_colors==1){
         //Figure out which color the card is in
       color_index=0;
       for (var jj=0; jj<5; jj++){
           if(this_card.colors[jj]>0){
             color_index=jj;
         }
       }
   
       //Case 2a: Set the current bias as capped bonus
       cur_bias = Math.min(COLOR_COMMIT_THRESHOLD/(1.0*denom),  draft.players[player_i].color_commit[color_index]/(1.0*denom));
     
         //Case 2b: if only has cards of one color, reduce bias by factor SING_COLOR_BIAS_FACTOR
         if (num_player_colors==1){
           cur_bias=cur_bias/SING_COLOR_BIAS_FACTOR;
       }

       //If committed to one color, give a bonus to the best second color
       if (player_colors==1 && (color_index==top_colors[1]) && draft.players[player_i].color_commit[color_index]>0){
           cur_bias=Math.max(SECOND_COLOR_FRAC*COLOR_COMMIT_THRESHOLD/(1.0*denom), cur_bias);
       }
       }

       //Multicolored: 2-3 colors
       if (num_card_colors==2 || num_card_colors==3){
         
       //Compute the commitment to the card as (on-color commit)-(off-color commit)
         on_color_amount=0;
       for (var k=0; k<5; k++){
         var color_commit_amount=Math.min(draft.players[player_i].color_commit[k], COLOR_COMMIT_THRESHOLD);
           if(this_card.colors[k]>0){
             on_color_amount=on_color_amount+color_commit_amount;
         } else {
             on_color_amount=on_color_amount-color_commit_amount;
         }
       }
  
         //Subtract MULTICOLOR_PENALTY from the bias
       cur_bias=on_color_amount/(1.0*denom) - MULTICOLOR_PENALTY;
       }

       //Mulitcolored: 4-5 colors, always difficult to cast. No bonus
       if (num_card_colors>=4){
         cur_bias=0;
       }
     }

     //Update the card's color bias and rating
     this_card.color_bias=cur_bias;
     this_card.value=parseFloat(this_card.color_bias)+parseFloat(this_card.myrating); 
  }
  return;
}


//Moves a card from player p's collection into their deck
function move_2_deck(p, col_index){
  //Pick the card and remove it from the pack
  draft.players[p].deck.push(draft.players[p].collection[col_index]);
  draft.players[p].collection.splice(col_index,1)
  
  //Autosort deck
  var total_cards=draft.players[p].deck.length+draft.players[p].basiclands.length
  draft.players[p].deck= sortByMultiple ( draft.players[p].deck, ["creaturesort", "cmc", "name"]);

  //update player deck text
  if(p==0){
    deck_text();
  }

  //Callng Print_collection() displays the change on the screen
  //Print_collection();
}

//Moves a card from the player p's collection into their collection
function move_2_collection(p, deck_index){
  //move from deck to collection
  draft.players[p].collection.push(draft.players[p].deck[deck_index]);
  draft.players[p].deck.splice(deck_index,1)

  //update player deck text
  if(p==0){
    deck_text();
  }
  
  //Calling Print_collection() displays the change on the screen
  //Print_collection()

  return;
}

//Removes a lands from player p's deck
function remove_land(p, land_index){
  draft.players[p].basiclands.splice(land_index,1)
  if(p==0){
    deck_text();
  }
  return;
}

//Return the table color for a given card's color vector
function get_color_code(vec){

  //count colors in the card
  var num_colors=0; 
  for(var x=0; x<5; x++){
    if(vec[x]>0){
      num_colors++;
    }
  }

  //Return color vector for the card
  if (num_colors<1){
    return '#E0D6CC';  //opaque
  } else if (num_colors>1){
    return '#CCB299';  //brown
  } else if (vec[0]>0) {
    return '#FFFFBF';  //white
  } else if (vec[1]>0) {
    return '#94DBFF';  //blue
  } else if (vec[2]>0) {
    return '#AAAAAA';  //black
  } else if (vec[3]>0) {
    return '#FFAAAA';  //red
  } else if (vec[4]>0) {
    return '#99E699';  //green
  }
  //Special case
  return '#CCB299';  //brown
} 

//Check if the card is in the player's colors. Returns 0 or 1
function check_oncolor(card_colors, player_colors){
  var on_color_card=1;
  for (var xx=0; xx<5;xx++){
    if(card_colors[xx] > 0 && player_colors[xx]==0){
      on_color_card=0;
    }
  } 
  return on_color_card;
}

//Adds 17 lands, evenly split between two colors
function seventeen_lands(pn){
  //Clear the lands in the deck
  draft.players[pn].basiclands=[];

  //Determine colors of cards in the deck
  deck_colors=[0,0,0,0,0];
  deck_length = draft.players[pn].deck.length;
  for (var i = 0; i < deck_length; i++) {
    card_colors=draft.players[pn].deck[i].colors;
    for (var j=0; j<5; j++){
      deck_colors[j]+=card_colors[j];
    }
  }

  //Evenly as possible on lands
  lands_to_add=40-draft.players[pn].deck.length
  
  //Determine top color in deck
  max_index=0;    
  for (var y=1; y<5; y++){
    if(deck_colors[y]>deck_colors[max_index]){
      max_index=y;
    }
  }
  
  //Determine secondary color
  second_max_index=0;
  if (max_index==0){second_max_index=1;}

  for (var z=0; z<5; z++){
    if(deck_colors[z]>deck_colors[second_max_index] && z!=max_index){
      second_max_index=z;
    }
  }

  //Add lands primary color
  lands_color1=Math.ceil(lands_to_add/2.0);
  for (var i=0; i<lands_color1; i++){
    addLand(pn, max_index);
  }
  
  //Add lands secondary color
  lands_color2=Math.floor(lands_to_add/2.0);
  for (var i=0; i<lands_color2; i++){
    addLand(pn, second_max_index);
  }
  return;
}


//Return player pn's deck to their collection
function clear_deck(pn){

  //Move deck to collection
  draft.players[pn].basiclands=[]
  var it=0;
  while(draft.players[pn].deck.length>0 && it<300){
    move_2_collection(pn, 0);
    it++;
  }

  //Sort and print collection
  draft.players[0].collection= sortByMultiple ( draft.players[0].collection, ["colorsort", "creaturesort", "cmc", "name"]);
  Print_collection();
  return;
}

//Sort cards in collection by rating
function sort_by_rating(pn){
  clear_deck(pn);
  draft.players[pn].collection= sortByMultiple ( draft.players[pn].collection, ["myrating", "name"]).reverse();
  Print_collection();
  document.getElementById("sort_button").onclick=function(){sort_by_color(0)};
  return;
}

//Sort cards in collection by color
function sort_by_color(pn){
  clear_deck(pn);
  draft.players[pn].deck= sortByMultiple ( draft.players[pn].deck, ["creaturesort", "cmc", "name"]);
  Print_collection();
  document.getElementById("sort_button").onclick=function(){sort_by_rating(0)};  
  return;
}

//Autobuild player pn's deck
//If 2 colors of cards are in the deck, build a deck of those colors
function autobuild(pn, colors){

  //Define colors of cards in deck
  var deck_colors=[0,0,0,0,0];

  //Check colors of card in deck
  deck_length=draft.players[pn].deck.length
  for (var j=0; j<deck_length; j++){
    var deck_card=draft.players[pn].deck[j];
    for (var i = 0; i < 5; i++) {     
      if(deck_card.colors[i]>0){
        deck_colors[i]+=1;
      }
    }
  }

  //Check number of colors
  var num_colors =0;
  for (var i=0; i<5; i++){
    if(deck_colors[i]>0){
      num_colors+=1;
    }
  }

  //If exactly two colors in deck, use these colors
  if (num_colors==2){
    colors=deck_colors;
  }

  //Clear deck
  var it=0;
  while(draft.players[pn].deck.length>0 && it<300){
    move_2_collection(pn, 0);
    it++;
  }

  //Add cards to deck
  var cont = 1;
  num_lands=0;

  //Add the highest rated cards to the deck one at a time
  while(draft.players[pn].deck.length<(draft.num_nonlands+num_lands) && cont>0){

    //Check each card in the collection
    var max_rating=0;
    var max_index=0;
    collection_length = draft.players[pn].collection.length;
    for (i = 0; i <collection_length; i++) {
    //Check the card's rating and colors    
      var card_rating=parseFloat(draft.players[pn].collection[i].myrating);
      card_colors=draft.players[pn].collection[i].colors;
      
      //Check for the best oncolor card
      if (card_rating>max_rating && !isNaN(card_rating) && (check_oncolor(card_colors, colors)>0)){
        max_rating=card_rating;
        max_index=i;
      }
    }

    //Add the best card if possible
    if (max_rating > 0){
      //Account for lands     
      if(draft.players[pn].collection[max_index].type=="Land" || draft.players[pn].collection[max_index].type=="land"){
        num_lands++;
      }
      
      //Add the chosen card to the deck
      move_2_deck(pn, max_index); 
    } else {
      cont=0; //No cards left to add
    }
  }    
  
  //Add basic lands
  seventeen_lands(pn);

  //For the human player, show and scroll to the deck
  if (pn==0){
    Print_collection();
    var target = document.getElementById('deck_container');
    target.scrollIntoView(true);
  }
  return;
}

//Autobuild the bot decks
function autobuild_bots(){
  for (var pn=1; pn<num_players; pn++){  
    autobuild(pn,draft.players[pn].in_color);
  }
  Print_collection();
  return;
}

//Determines the unique elements of an array.
//This function is used in printing the deck text
function uniq(a) {
  var seen = {};
  return a.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

//Print the player's deck text at the bottom of the screen
function deck_text(){

  //If the deck is not complete (<40 cards), clear the deck text
  var total_cards=draft.players[0].deck.length+draft.players[0].basiclands.length   
  if(total_cards<40){
    document.getElementById("deck_text").innerHTML="";    
    document.getElementById("deck_text").style.display="none"
    return;
  }

  //Make the deck text window visible
  document.getElementById("deck_text").style.display="inline-block"

  //Create an array of card names
  deck_names=[];
  deck_length=draft.players[0].deck.length;
  for (var i=0; i<deck_length; i++){
    deck_names.push(draft.players[0].deck[i].name);
  }
  lands_length=draft.players[0].basiclands.length;
  for (var i=0; i<lands_length; i++){
    deck_names.push(draft.players[0].basiclands[i].name);
  }

  //Get the unique names and counts of each card
  your_array=deck_names;
  var counts = {};
  your_array.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
  unique_array=uniq(your_array);
  
  //Write the deck text to the window
  cur_html="//Deck from draftsim.com<br>";
  array_length=unique_array.length;
  for (var i=0; i<array_length; i++){
    cur_html=cur_html+ counts[unique_array[i]].toString() + " " +
             unique_array[i].replace("_", ' ').replace("_", ' ').replace("_", ' ').replace("_", ' ').replace("_", ' ').replace("_", ' ')
             + "  " + "<br>";
  }
  document.getElementById("deck_text").innerHTML=cur_html
  return;
}

//Print the player's collection to the screen
//Call this function to update the screen after moving cards between zones
function Print_collection(){

  //Update the color biases for the current pack
  update_bias_pack(0); 

  //Clear images
  pack_length = draft.players[0].pack.pack_contents.length;
  document.getElementById("pack_images").innerHTML = "";
 
  //Set visibilities based on the stage of the draft
  var cards_picked = draft.players[0].collection.length + draft.players[0].deck.length;
  if (cards_picked==0){
    show_bot_decks=0;
  }
  if (cards_picked>=3*PACK_SIZE){
    draft_end_visibility(); 
  } else {
    draft_start_visibility();
  } 
 
  //Images for cards in the pack
  for (i = 0; i < pack_length; i++) {
    var cur_html = document.getElementById("pack_images").innerHTML;
    var card = draft.players[0].pack.pack_contents[i];
    var card_name = card.name.replace(/_/g, " ");
    var extra_html = "<img src=" + card.image + " width=\"223\" height=\"311\" " +  " alt=\"" +
                      card_name + "\" title=\"" + card_name + "\" "+ "id=card_" +
                      i + " onclick=make_pick(" + i + ") />";
    document.getElementById("pack_images").innerHTML = cur_html + extra_html;
  }

  //Load next bot images when current ones are finished loading
  tmp_pass_amount=-1;
  var cards_picked = draft.players[0].collection.length + draft.players[0].deck.length
  if (cards_picked <= PACK_SIZE-1 || cards_picked >= 2*PACK_SIZE ){
    tmp_pass_amount=+1;
  }
  var next_bot_index = (num_players - tmp_pass_amount) % num_players;
  if (num_players>1){
    document.getElementById("pack_images").onload=preload_bot_images(draft.players[next_bot_index])
  }

  //Clear the table that contains the pack text
  var tablep = document.getElementById("pack_text");
  tablep.innerHTML=""; //clear the table

  //Compute card ratings
  var values=[];
  for (k=0;k<pack_length; k++){
    cur_card=draft.players[0].pack.pack_contents[k];      
  values.push((parseFloat(cur_card.myrating) + parseFloat(cur_card.color_bias)));
  }

  //Sort the cards in the table by rating
  var test = values;
  var test_with_index = [];
  for (var i in test) {
    test_with_index.push([test[i], i]);
  }
  test_with_index.sort(function(left, right) {
  return left[0] > right[0] ? -1 : 1;
  });
  var indexes = [];
  test = [];
  for (var j in test_with_index) {
    test.push(test_with_index[j][0]);
    indexes.push(test_with_index[j][1]);
  }

  //Construct the table
  var rows_2_show = Math.min(pack_length, 15); //no min
  for (i = 0; i < rows_2_show; i++) {
    var row = tablep.insertRow(i);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);   
    var cell4 = row.insertCell(3);
    row.onclick="make_pick(" + i + ")";

   //Add text based on the card properties
   var cur_card = draft.players[0].pack.pack_contents[indexes[i]];
   var cur_color = get_color_code(cur_card.colors);
   cell1.innerHTML = "<li style='min-width:400px;background-color:" + cur_color +
                     "'; onclick=make_pick(" + indexes[i] + ")>" +
                     cur_card.name.replace("_", ' ').replace("_", ' ').replace("_", ' ').replace("_", ' ').replace("_", ' ')
                     + "</li>";
   cell2.innerHTML = cur_card.myrating;
   if (cur_card.hasOwnProperty('color_bias')){
     if (cur_card.color_bias>=0){    
       cell3.innerHTML = "+" + cur_card.color_bias.toFixed(1).replace(/^0+/, '');
     } else {
       cell3.innerHTML = cur_card.color_bias.toFixed(1).replace(/^0+/, '');
     }
   } else {
     cell3.innerHTML="0";
   }
   cell4.innerHTML =  (parseFloat(cur_card.myrating) + parseFloat(cur_card.color_bias)).toFixed(1);
  }

  //Add titles to the table
  var header = tablep.createTHead();
  var row = header.insertRow(0);
  var head1 = row.insertCell(0);
  var head2 = row.insertCell(1);
  var head3 = row.insertCell(2);
  var head4 = row.insertCell(3);
  head1.innerHTML = "<b>  Name  </b>";
  head2.innerHTML = "<b>Base Rating</b>";
  head3.innerHTML = "<b>Color</b>";
  head4.innerHTML = "<b>Overall</b>";

  //Remove the table if the pack doesn't contain any cards
  if(draft.players[0].pack.pack_contents.length==0){
    tablep.innerHTML="";
  }

  //Set visibility of sorting buttons
  if (draft.players[0].collection.length>0 && num_players>1 && (typeof sort_collection == "undefined")){
    document.getElementById("sort_deck").style.display="inline";
  } else {
    document.getElementById("sort_deck").style.display="none";
  }

  //Sort player's collection if needed
  if (typeof sort_collection !== "undefined"){
    //sort by color
    if (sort_collection == 1){
      draft.players[0].collection= sortByMultiple ( draft.players[0].collection, ["colorsort", "creaturesort", "cmc", "name"]);         
    }
  }

  //Display images of cards in player's collection
  collection_length=draft.players[0].collection.length;
  document.getElementById("collection_img").innerHTML = "";
  for (i = 0; i < collection_length; i++) {
    var cur_html = document.getElementById("collection_img").innerHTML;
    var extra_html = "<img src=" + draft.players[0].collection[i].image + " width=\"223\" height=\"311\" " +
                     " id=coll_0_" + i + " onclick=move_2_deck(0," + i + ");Print_collection();>";
    document.getElementById("collection_img").innerHTML = cur_html + extra_html;
  }

  //Display player's deck
  if (draft.players[0].deck.length>0 || draft.players[0].basiclands.length>0){
    cards_in_deck= parseFloat(draft.players[0].deck.length) + parseFloat(draft.players[0].basiclands.length);
    document.getElementById("deck_title").innerHTML = "<p>Deck " + cards_in_deck + "</p>";
  } else {
    document.getElementById("deck_title").innerHTML = "<p>Deck</p>"
  }
  document.getElementById("deck_img").innerHTML = "";
  
  //Display bot decks
  for (var pn=0; pn<num_players; pn++){ 
    
    //Go through each card in the deck
    deck_length=draft.players[pn].deck.length;
    for (var i = 0; i < deck_length; i++) {
      var cur_card = draft.players[pn].deck[i];
      cur_card.id = "deck_"+pn+"_" +i;
     
     //Display card images
     if (typeof cur_card != "undefined"){
       var cur_html = document.getElementById("deck_img").innerHTML;
       var extra_html = "<img src=" + draft.players[pn].deck[i].image + " width=\"223\" height=\"311\" " +
                        " id=deck_" + pn + "_" + i + " onclick=move_2_collection(" + pn + "," + i +
                        ");Print_collection();>";
       document.getElementById("deck_img").innerHTML = cur_html + extra_html;
     }
   }
 }

 //Display basic lands for each deck
 for (var pn=0; pn<num_players; pn++){  
   lands_length=draft.players[pn].basiclands.length
   for (var i = 0; i < lands_length; i++) {
     var cur_card = draft.players[pn].basiclands[i];
     
     //Display the basic land images
     if (typeof cur_card != "undefined"){ //make sure card isnt undefined
       var cur_html = document.getElementById("deck_img").innerHTML;
       var extra_html = "<img src=" + draft.players[pn].basiclands[i].image + " width=\"223\" height=\"311\" " +
                        " onclick=remove_land(" + pn + "," + i + ");Print_collection();>";
       document.getElementById("deck_img").innerHTML = cur_html + extra_html;
     }
   }
 }


  //Display bots collection if show_bot_decks is enabled
  document.getElementById("bot_collection_img").innerHTML="";
  if ((typeof show_bot_decks != "undefined") && show_bot_decks==1){
    for (var bot_num=1; bot_num<num_players; bot_num++){
      bot_collection_length=draft.players[bot_num].collection.length;
   
      document.getElementById("bot_collection_img").innerHTML =
      document.getElementById("bot_collection_img").innerHTML + "<br>" + "Bot" + bot_num + ":" + "<br>";
     
      //For each card in the collection
      for (var i = 0; i < bot_collection_length; i++) {
        var cur_card = draft.players[bot_num].collection[i];
 
        //Display the card images
        if (typeof cur_card != "undefined"){
          var img = document.createElement("img");
          img.src = cur_card.image;
          img.height="311";
          img.width="223";
          document.getElementById("bot_collection_img").appendChild(img);
        }
      }
      document.getElementById("bot_collection_img").innerHTML = document.getElementById("bot_collection_img").innerHTML + "<br>";
    }
  }
  return;
}


//Tool that preloads images from the next pack
var ImagePreloader = function() {
    this.images = {};
};
ImagePreloader.prototype.preload_image = function(image_url) {
    var image = new Image();
    image.src = image_url;
    image.height="311";
    image.width="223";
    this.images[image_url] = image;
}
var image_preloader = new ImagePreloader();

//The player picks a card at location card_index from the pack
//The bots then make picks and the packs are passed
function make_pick(card_index){

  //The pick must be a card in the pack
  pack_length=draft.players[0].pack.pack_contents.length
  if(card_index >= pack_length){
    return 0;
  } else {
  
    //Update the player's color commitment
    for (i = 0; i < 5; i++) { 
      if(draft.players[0].pack.pack_contents[card_index].colors[i]>0){
        draft.players[0].color_commit[i]+=Math.max(0,draft.players[0].pack.pack_contents[card_index].myrating-RATING_THRESH);
      }
    }
  
    //Pick the card and remove it from the pack
    draft.players[0].collection.push(draft.players[0].pack.pack_contents[card_index]);
    draft.players[0].pack.pack_contents.splice(card_index,1);

    //Bots make picks
    for (jj = 1; jj < num_players; jj++) { 
      bot_pick(jj);
    }

    //Pass the remaining cards and open a new pack if needed
    var cards_picked = draft.players[0].collection.length + draft.players[0].deck.length
    if (cards_picked <= PACK_SIZE-1){  //Pass left
      pass_cards(+1);
    } else if (cards_picked == PACK_SIZE) {  //Generate pack 2
      for (i = 0; i < num_players; i++) { 
        var pack_2=new Pack(draft.set2);
        draft.players[i].pack=pack_2;
      }
    } else if (cards_picked <= 2*PACK_SIZE-1) {  //Pass right
      pass_cards(-1);
    } else if (cards_picked == 2 * PACK_SIZE) {   //Generate pack 3
      for (i = 0; i < num_players; i++) { 
        var pack_3=new Pack(draft.set3);
        draft.players[i].pack=pack_3;
      }
    } else if (cards_picked <= 3*PACK_SIZE-1) { //Pass left
      pass_cards(+1);
    } else if (cards_picked == 3*PACK_SIZE) {
      //No cards left to pass
    }

  //Go to the next pick
  Print_collection();
  }
  return;
}

//Preload the images in the next bot's pack
function preload_bot_images(bot) {
  for (var i = 0; i < bot.pack.pack_contents.length; i++) {
    var card = bot.pack.pack_contents[i];
    image_preloader.preload_image(card.image);
  }
  return;
}

//Pass cards to left or right (+1,-1)
function pass_cards(pass_amount){
  //Dummy initialization of a pack storage list
  var tmp_packs=['1', '2', '3', '4', '5', '6', '7', '8'];
  
  //Move the packs to the temporary pack storage list
  for (i=0; i<num_players; i++){
   var p_index = ((i+pass_amount)+ num_players) % num_players;
   tmp_packs[p_index] = draft.players[i].pack;
  }

  //Pass the packs to new players
  for (i=0; i<num_players; i++){
    draft.players[i].pack=tmp_packs[i];
  }

  //Bot images loaded when current pack is done loading
  //The bot that's going to pass to the player next
  //var next_bot_index = (num_players - pass_amount) % num_players;
  //preload_bot_images(draft.players[next_bot_index]);

  return;
}

//The bot numbered bot_index picks the highest rated card in its pack
function bot_pick(bot_index){

  //Update color bias for bot
  update_bias_pack(bot_index); 
 
  //output to screen 
  var pack_length=draft.players[bot_index].pack.pack_contents.length;
 
  //Determine the highest rated card
  var best_rating=0;
  var best_index=0;
  for (var i = 0; i < pack_length; i++) { 
    //Determine the current card's rating
    this_card=draft.players[bot_index].pack.pack_contents[i];
    this_card.value=parseFloat(this_card.myrating)+parseFloat(this_card.color_bias);
    var cur_rating = parseFloat(this_card.value);

    //Update the highest rated card
    if (cur_rating > best_rating){
      best_rating=cur_rating;
      best_index=i;
    }
  }
 
  //Determine the picked card
  var picked_card=draft.players[bot_index].pack.pack_contents[best_index];

  //Update color commitment
  for (i = 0; i < 5; i++) { 
    if(picked_card.colors[i]>0){
      draft.players[bot_index].color_commit[i]+=Math.max(0,picked_card.myrating-RATING_THRESH);
    }
  }

  //Pick the card and remove it from the pack 
  draft.players[bot_index].collection.push(draft.players[bot_index].pack.pack_contents[best_index]);
  draft.players[bot_index].pack.pack_contents.splice(best_index,1);

  return;
}

//Adds cards in selected pack to collection. For sealed
function pick_cards(cur_pack){
  //While there are cards in the pack, add them to collection
  while(cur_pack.pack_contents.length>0){
      draft.players[0].collection.push(cur_pack.pack_contents[0]);
      cur_pack.pack_contents.splice(0,1);
  }
  return;
}

//Generate a pool for sealed deck construction
//Utilizes the draft deckbuilding features
function Sealed(S1, S2, S3, S4, S5, S6){

  //Create draft object. Deck construction logic the same in sealed and draft
  draft = new Draft(S1, S2, S3, 1);
  draft.players[0].pack_contents=[];

  //Generate packs and add cards to collection
  pack1 = new Pack(S1); pick_cards(pack1);
  pack2 = new Pack(S2); pick_cards(pack2);
  pack3 = new Pack(S3); pick_cards(pack3);
  pack4 = new Pack(S4); pick_cards(pack4);
  pack5 = new Pack(S5); pick_cards(pack5);
  pack6 = new Pack(S6); pick_cards(pack6);

  //Update color commitment
  collection_length=draft.players[0].collection.length;
  for (var j = 0; j<collection_length; j++){
    cur_card=draft.players[0].collection[j];
    for (i = 0; i < 5; i++) {
      if(cur_card.colors[i]>0){
        draft.players[0].color_commit[i]+=Math.max(0,cur_card.myrating-RATING_THRESH);
      }
    }
  }

  //Update best colors
  update_in_color(0);

  //Sort the pool
  draft.players[0].collection= sortByMultiple ( draft.players[0].collection, ["colorsort", "creaturesort", "cmc", "name"]);

  //Print the deck
  Print_collection();
  return;
}

//This section contains the draft and sealed modes available to the user
//Sets are ordered from newer to older

function Draft_AER(){
  draft = new Draft(AER, AER, KLD, 8);
  Print_collection();
  return;
}

function Sealed_AER(){
  Sealed(AER, AER, AER, AER, KLD, KLD);
  return;
}

function Draft_KLD(){
  draft = new Draft(KLD, KLD, KLD, 8);
  Print_collection();
  return;
}

function Sealed_KLD(){
  Sealed(KLD, KLD, KLD, KLD, KLD, KLD);
  return;
}

function Draft_EMN(){
  draft = new Draft(EMN, EMN, SOI, 8);
  Print_collection();
  return;
} 

function Sealed_EMN(){
  Sealed(EMN, EMN, EMN, EMN, SOI, SOI);
  return;
}

function Draft_SOI(){
  draft = new Draft(SOI, SOI, SOI, 8);
  Print_collection();
  return;
}

function Sealed_SOI(){
  Sealed(SOI, SOI, SOI, SOI, SOI, SOI);
  return;
}

function Draft_OGW(){
  draft = new Draft(OGW, OGW, BFZ, 8);
  Print_collection();
  return;
}

function Sealed_OGW(){
  Sealed(OGW, OGW, OGW, OGW, BFZ, BFZ);
  return;
}

function Draft_BFZ(){
  draft = new Draft(BFZ, BFZ, BFZ, 8);
  Print_collection();
  return;
}

function Sealed_BFZ(){
  Sealed(BFZ, BFZ, BFZ, BFZ, BFZ, BFZ);
  return;
}

function Draft_ORI(){
  draft = new Draft(ORI, ORI, ORI, 8);
  Print_collection();
  return;
}

function Sealed_ORI(){
  Sealed(ORI, ORI, ORI, ORI, ORI, ORI);
  return;
}

function Draft_DTK(){
  draft = new Draft(DTK, DTK, FRF, 8);
  Print_collection();
  return;
}

function Sealed_DTK(){
  Sealed(DTK, DTK, DTK, DTK, DTK, DTK);
  Print_collection();
  return;
}

//Get the mode from the URL
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

//When the window loads, get the draft mode from the URL
 window.onload = function(){
  
  //mode is the argument of the URL
  var mode = getParameterByName('mode');
  if (mode == 'Draft_AER'){
    Draft_AER();
  } else if (mode == 'Sealed_AER'){
    Sealed_AER(); 
  } else if (mode == 'Draft_KLD'){
    Draft_KLD();
  } else if (mode == 'Sealed_KLD'){
    Sealed_KLD();
  } else if (mode == 'Draft_EMN'){
    Draft_EMN();
  } else if (mode == 'Sealed_EMN'){
    Sealed_EMN();
  } else if (mode == 'Draft_SOI'){
    Draft_SOI();
  } else if (mode == 'Sealed_SOI'){
    Sealed_SOI();
  } else if (mode == 'Draft_OGW'){
    Draft_OGW();
  } else if (mode == 'Sealed_OGW'){
    Sealed_OGW();
  } else if (mode == 'Draft_BFZ'){
    Draft_BFZ();
  } else if (mode == 'Sealed_BFZ'){
    Sealed_BFZ();
  } else if (mode == 'Draft_ORI'){
    Draft_ORI();
  } else if (mode == 'Sealed_ORI'){
    Sealed_ORI();
  } else if (mode == 'Draft_DTK'){
    Draft_DTK();
  } else if (mode == 'Sealed_DTK'){
    Sealed_DTK();
  } else {
    document.getElementById("debug").innerHTML="Use the navigation bar above";
  }
};


