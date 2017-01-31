//Create a pack of cards for the listed set
import KLD from './KLD';
import AER from './AER';
import KLD_inventions from './KLD_inventions';
import AER_inventions from './AER_inventions';

import { fieldSorter } from './helpers';

export function Pack(card_list){

  //The pack contents contain cards
  let pack_contents=[];
    
  const PACK_SIZE=14;

  //This section lists the number of cards of each rarity and color
  var common=0;
  var uncommon=0;
  var rare=0;
  var mythic=0;
  var common_colors=[0,0,0,0,0,0,0]; //WUBRG, artifacts, multi

  //Number of cards in the set
  var cards_in_set=card_list.length

  //Select whether a mythic or rare is in the pack
  const mythic_roll=Math.floor((Math.random() * 121) + 1);
  if (mythic_roll>15){
    mythic=1;
  } else {
    rare=1;
  }
  
  //Add cards to the pack without duplication
  //Iteration counter prevents infinite loops
  let its=0; 
  const max_its=10000;
  while(pack_contents.length<PACK_SIZE && its<max_its){
    its += 1;
    
    //Choose a random card in the current set
    var card_roll=Math.floor((Math.random() * cards_in_set));
    var new_card = card_list[card_roll];
    
    //Check if card in pack contents
    var card_in_pack=0;
    if (pack_contents.length>0){
      for (var i = 0; i < pack_contents.length; i++) {
        if ( new_card.name===pack_contents[i].name){
          card_in_pack=1;
        }
      }
    }
    
    //No more than 3 commons of any one color
    let too_many=0;
    let color_index = parseInt( card_list[card_roll].colorsort,10 );
    if (color_index < 5 && common_colors[color_index] > 2 && its<max_its/2){
      too_many=1;
    }
    
    //Count number of unused colors
    let num_zeros=0;
    for (let i=0; i<5; i++){
      if (common_colors[i] === 0 ){
        num_zeros += + 1;
      }
    }
    
    //cards remaining (including this one)
    let num_cards_to_add = PACK_SIZE - pack_contents.length;
    
    //Reroll if needed to ensure at least 1 common of each color in pack
    num_cards_to_add = PACK_SIZE - pack_contents.length;
    if (num_cards_to_add<=num_zeros && ( (common_colors[color_index]!==0) ||
       (color_index>4) ) && (its<(max_its/2)) ) {
      too_many=1;
    }
    
    //Determine card rarity and add new card to pack if possible, in rarity order
    let rarity_nc = new_card.rarity
    if (card_in_pack<1 && too_many<1){
      if (rarity_nc === "M" && mythic < 1){
        pack_contents.push(card_list[card_roll]);
        mythic += 1; 
      } else if (rarity_nc === "R" && rare < 1 && mythic === 1){
        pack_contents.push(card_list[card_roll]);
        rare += 1;
      } else if (rarity_nc === "U" && uncommon < 3 && rare === 1 && mythic === 1){
        pack_contents.push(card_list[card_roll]);
        uncommon += 1;
      } else if (rarity_nc === "C" && common < PACK_SIZE-4 && uncommon === 3){
        pack_contents.push(card_list[card_roll]);
        color_index = parseInt( card_list[card_roll].colorsort, 10);
        common_colors[color_index] += 1;
        common += 1;
      }
    }    
  }

  // Out for now, doing only Aether Revolt Sealed
  //FRF - remove last common and add land
  // if(card_list[0].name=="Citadel_Siege"){
  //   pack_contents.splice(PACK_SIZE-1,1);
  //   var land_roll = Math.floor((Math.random() * 10));
  //   pack_contents.push(FRF_lands[land_roll]);
  // }
  
  //KLD - 1/144 chance of removing last common and adding invention
  let inc_inv_roll;
  let invention_roll;
  if(card_list[0].name === "Acrobatic_Maneuver"){
    inc_inv_roll = Math.floor(Math.random()*144)
    if (inc_inv_roll === 0){
      pack_contents.splice(PACK_SIZE-1,1);
      invention_roll = Math.floor((Math.random() * 30));
      pack_contents.push(KLD_inventions[invention_roll]);
    }
  }

  //AER - 1/144 chance of removing last common and adding invention
  if(card_list[0].name === "Aerial_Modification"){
    inc_inv_roll = Math.floor(Math.random()*144)
    if (inc_inv_roll === 0){
      pack_contents.splice(PACK_SIZE-1,1);
      invention_roll = Math.floor((Math.random() * 24));
      pack_contents.push(AER_inventions[invention_roll]);
    }
  }
 
  // Out for now, Only Aether Revolt
  // //SOI/EMN - add flip card
  // var flip_card_set=0;
  // if(card_list[0].name === "Aim_High"){
  //   flip_card_set=1; //SOI
  // }
  // if(card_list[0].name === "Blessed_Alliance"){
  //   flip_card_set=2; //EMN
  // }

  // //if we need flip cards
  // if(flip_card_set>0){
  //   //remove the last common
  //   pack_contents.splice(PACK_SIZE-1,1);
    
  //   //Determine if we need to add a rare/mythic
  //   var flip_rare=0;
  //   var rare_roll=Math.floor((Math.random() * 8));
  //   if (rare_roll === 1){
  //     flip_rare=1;
  //     //remove another common
  //     pack_contents.splice(PACK_SIZE-2,1);
  //   }

  //   //SOI set file organized as 4 commons, 20 uncommons, 6 rares, and 3 mythics
  //   //EMN set file has          4 commons, 10 uncommons, 5 rares, and 2 mythics
  //   var num_com_uncom=2;
  //   let num_rare_myth;
  //   if (flip_card_set ===1 ){
  //      num_com_uncom=24; //SOI
  //      num_rare_myth=9;
  //   } else if (flip_card_set === 2){
  //      num_com_uncom=14; //EMN
  //      num_rare_myth=7;
  //   }

  //   //Add a common/uncommon, reroll uncommons 3/5 of the time
  //   var converged=0;
  //     while(converged === 0){
  //     var com_flip_roll=Math.floor((Math.random() * num_com_uncom));
  //       var reroll_uncommons=Math.floor((Math.random() * 5)); //reroll if > 1
  //         if (com_flip_roll<4){ //if we have a common
  //           converged=1;
  //   } else if (reroll_uncommons<2){
  //     converged=1;
  //   }
  //     }      
  //   if(flip_card_set === 1){
  //     pack_contents.push(SOI_flip[com_flip_roll]);
  //   } else if (flip_card_set === 2){
  //     pack_contents.push(EMN_flip[com_flip_roll]);
  //   }

  //   //Add a rare if needed
  //   if (flip_rare === 1){
      
  //     //Add a rare/mythic, reroll rares 1/2 of the time
  //     var converged=0;
  //       while(converged === 0){
  //       var rare_flip_card=Math.floor((Math.random() * num_rare_myth))+num_com_uncom;
  //         var reroll_mythics=Math.floor((Math.random() * 2 )); //reroll if == 1
  //           if (rare_flip_card<30){
  //             converged=1;
  //     } else if (reroll_mythics === 0){
  //       converged=1;
  //     }
  //       }
  //     //add the rare
  //     if (flip_card_set === 1){
  //       pack_contents.push(SOI_flip[rare_flip_card]);
  //     } else if (flip_card_set === 2) {
  //       pack_contents.push(EMN_flip[rare_flip_card]);
  //     }
  //   }
  // }
  return pack_contents;
}

export function Draft(S1, S2, S3, S4, S5) {
  const args = [...arguments];
  if (args.length !== 5) { console.log("Wrong amount of arguments"); return;}
  let draft = [];
  args.forEach((set) => {
    // So this is a bit of a hack to give each card a collection index
    // We use this so duplicate cards are not the same reference in the array
    // It makes our lives a lot easier.
    let numbered_pack = JSON.parse(JSON.stringify(Pack(set))).map((card, index) => {
      card.collection_index = draft.length + index;
      return card;
    })
    draft = [...draft, ...numbered_pack];
  });
  return draft;
}

export function DraftAER(){
  return Draft(AER, AER, AER, KLD, KLD);
}

function FieldSort(collection,fields) {
  let sorted;
  sorted = collection.sort(fieldSorter([...fields]))
  return sorted;
}

export function SortColor(collection){
  return FieldSort(collection, ["colorsort", "creaturesort", "cmc", "name"])
}

export function SortCreature(collection){
  return FieldSort(collection, ["creaturesort", "cmc", "name"])
}

export function SortRating(collection) { 
  return FieldSort(collection, ["myrating", "name"])
}