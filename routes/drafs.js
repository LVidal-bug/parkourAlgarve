//  if (!req.query.city && !req.query.searchInput) {
//   const spots = await Spot.find({ confirmed: 'Confirmed' })
//    let array = []
//    let array1 = []
//    for (let s of spots) {
//    let obj = {
//           geometry: s.geometry,
//         properties: {
//             id: s._id,
//            title: s.title,
///            imageURL: s.images[0].url
//        }
//    }
//      array.push(obj)
//  }
//  return res.status(200).json({
//      features: array
//  });

// }
// if (req.query.city && req.query.searchInput) {
//    const { searchInput, city } = req.query
// console.log(city)
//  let query = searchInput.toLowerCase()
//  for (let q of query) {
//    if (q === ' ') {
//          query = query.replace(q, '')
//       }
//    }
//   if (city === '1') {
//   const spots = await Spot.find({ titleQuery: query, confirmed: 'Confirmed' })
//     console.log(spots)
//     let array = []
//     let array1 = []
//     for (let s of spots) {
//       let obj = {
//            geometry: s.geometry,
//           properties: {
//             id: s._id,
//              title: s.title,
//             imageURL: s.images[0].url
//         }
//      }
//       array.push(obj)
//   }
//   return res.status(200).json({
//        features: array
//    });
//}

// if (city !== '1') {
//      const spots = await Spot.find({ titleQuery: query, confirmed: 'Confirmed', city })
//    let array = []
//    let array1 = []
//    for (let s of spots) {


//     let obj = {
//          geometry: s.geometry,
//         properties: {
//              id: s._id,
//             title: s.title,
//           imageURL: s.images[0].url
//       }
//   }
//    array.push(obj)
//}
// return res.status(200).json({
//     features: array
//  });
//}
// }

//if (!req.query.searchInput && req.query.city) {
//   const { city } = req.query
//   if (city === 'Todos') {


//   const spots = await Spot.find({ confirmed: 'Confirmed' })
//   let array = []
//   let array1 = []
//    for (let s of spots) {
//     let obj = {
//         geometry: s.geometry,
//       properties: {
//          id: s._id,
//          title: s.title,
//          imageURL: s.images[0].url
//        }
//    }
//    array.push(obj)
//  }
//  return res.status(200).json({
//        features: array
//    });
// }
//  const spots = await Spot.find({ confirmed: 'Confirmed', city })
//
//  let array = []
//   let array1 = []
//   for (let s of spots) {
//       let obj = {
//    geometry: s.geometry,
//     properties: {
//       id: s._id,
//          title: s.title,
//           imageURL: s.images[0].url
//     }
//    }
// array.push(obj)
// }
// return res.status(200).json({
//      features: array
//  });
// }
const url = req.url
if (!req.query.city && !req.query.searchInput) {
    const spots = await Spot.find({ confirmed: 'Confirmed' })
    return res.render('spots/allSpots', { spots, url })
}
if (req.query.city && req.query.searchInput) {
    const { searchInput, city } = req.query
    let query = searchInput.toLowerCase()
    for (let q of query) {
        if (q === ' ') {
            query = query.replace(q, '')
        }
    }
    if (city === '1') {
        const spots = await Spot.find({ titleQuery: query, confirmed: 'Confirmed' })
        return res.render('spots/allSpots', { spots, url })
    }

    if (city !== '1') {
        const spots = await Spot.find({ titleQuery: query, confirmed: 'Confirmed', city })
        return res.render('spots/allSpots', { spots, url })
    }
}

if (!req.query.searchInput && req.query.city) {
    const { city } = req.query
    if (city === 'Todos') {
        const spots = await Spot.find({ confirmed: 'Confirmed' })
        return res.render('spots/allSpots', { spots, url })
    }
    const spots = await Spot.find({ confirmed: 'Confirmed', city })
    return res.render('spots/allSpots', { spots, url })
}
// <select class="form-select mr-1 " name="city" aria-label="Default select example">
//                                     <option selected value="1">Cidades:</option>
//                                     <option value="Faro">Faro</option>
//                                    <option value="Portimão">Portimão</option>
//                                    <option value="Lagos">Lagos</option>
//                                    <option value="Lagoa">Lagoa</option>
//                                    <option value="Albufeira">Albufeira</option>
//                                   <option value="Aljezur">Aljezur</option>
//                                   <option value="Monchique">Monchique</option>
//                                   <option value="Silves">Silves</option>
//                                  <option value="São Brás">São Brás</option>
//                                   <option value="Olhão">Olhão</option>
//                                  <option value="Tavira">Tavira</option>
//                                  <option value="Alcoutim">Alcoutim</option>
///                                  <option value="Castro Marim">Castro Marim</option>
//                                 <option value="Vila Real de Santo António">Vila Real de Santo António
//                                 </option>
//                            </select>


//  <div class="spots">
//                  <% for(let spot of spots){ %>
//                     <div class="spot">

//                     <div class="info2">
//                       <h5 class="title">
//                            <%=spot.title %>
//                        </h5>
//                       <p class="city">
//                          <%=spot.city %>
//                       </p>
//                       <p class="shortDes">
//                         <% if(spot.description.length <=50) {%>
//                               <%=spot.description.substring(0,30) %>
//                               <% }else{ %>
//                                    <%=spot.description.substring(0,25) %> ...
//                                       <% } %>
//                  </p>
//                   <a href="/spot/<%=spot._id %> " class="btn btn-primary moreInf">Mais
//                      detalhes</a>
//            </div>
//            <img src="<%=spot.images[0].url %> " class="" alt="...">
//        </div>
//         <% } %>
// </div>

//<%if(!spots.length){%>
//<div class="error">
//     <h3>Nenhum spot encontrado 404</h3>
//     <p>Não conseguimos encontrar nehum spot correspondente aos dados inseridos.</p>
// </div>
//   <% } %></div>

// const spots = '<%-JSON.stringify(spots) %>'
//  const spotsCoords = '<%-JSON.stringify(spots.geometry) %>'
//   const spotsImages = '<%-JSON.stringify(spots.images)%>'
//   const spotstitle = '<%-JSON.stringify(spots.title)%>'


// <% let show=true %>
//                    <% if (spot.likes.length>= 1){%>
//                         <% for(let like of spot.likes){%>
//                    <% if(`${like}`!==`${currentUser._id}`){%>
//                             <% show=true%>
//                       <% }if(`${like}`===`${currentUser._id}`){ %>
//                         <% show=false %>
//                          <% } %>
//                     <% } %>
//  //                            <% } %>
//                           </p>
//                            <% if(currentUser){ %>
//                           <% if(!show) {%>
//                        <form
//                               action="/spot/<%=spot._id %>/unlike"
//                          method="POST">
//                    <button class="noback">
//
//            <svg xmlns="http://www.w3.org/2000/svg"
//               width="50"
//        height="50"
//            fill="white"
//        class="bi bi-hand-thumbs-up-fill"
//         viewBox="0 0 16 16">
//            d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
//   </svg>

//  </button>
//</form>
//   <% }if(show){ %>
//    <form
//     action="/spot/<%=spot._id %>/like"
//     method="POST">
//    <button class="noback">

//       <svg xmlns="http://www.w3.org/2000/svg"
//      width="50"
//      height="50"
//   fill="white"
//   class="bi bi-hand-thumbs-down-fill"
//    viewBox="0 0 16 16">
//       <path
//            d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z" />
//     </svg>

//  </button>
// </form>
//  <% } %>
//      <% } %>

router.post('/spot/:spotId/like', isLoggedIn, catchAsync(async (req, res) => {
    const { spotId } = req.params
    const spot = await Spot.findById(spotId)
    for (let user of spot.likes) {

        if (`${user}` === `${req.user._id}`) {
            console.log('ai')
            req.flash('error', 'Só pode dar um like por Spot')
            return res.redirect(`/spot/${spotId}`)
        }
    }
    spot.likes.push(req.user._id)
    await spot.save()
    console.log(spot)
    return res.redirect(`/spot/${spotId}`)
}))

router.post('/spot/:spotId/unlike', isLoggedIn, catchAsync(async (req, res) => {
    const { spotId } = req.params
    const spot = await Spot.findById(spotId)
    let newArr = []
    for (let like of spot.likes) {
        if (`${like}` !== `${req.user._id}`) {
            newArr.push(like)
        }
        else {
            newArr = []
        }
    }
    spot.likes = newArr
    console.log(newArr)
    await spot.save()
    console.log(spot)
    return res.redirect(`/spot/${spotId}`)
}))