// {/* filter bar */}
// <div className="row extra-filters-row justify-content-center align-items-center py-3"
// // style={{ height: "80px" }}
// >
//   <div className="col-md-2 col-12 mt-3 mt-md-0">
//     <select
//       name="states"
//       id="states"
//       className="form-select"
//       aria-label=".form-select-sm example"
//     // onChange={onFieldsChange}
//     >
//       <option value="">State</option>
//       {states ? (
//         states.map((state, Index) => {
//           let optionToSelectByDefault = document.getElementById(
//             `stateFilter-${state.state_id}`
//           );
//           {/* if (dataToPost.state_id && optionToSelectByDefault) {
//             if (dataToPost.state_id === state.state_id) {
//               optionToSelectByDefault.selected = true;
//             }
//           } */}
//           return (
//             <option
//               id={`stateFilter-${state.state_id}`}
//               key={Index}
//               value={state.state_id}
//             >
//               {state.state_name}
//             </option>
//           );
//         })
//       ) : (
//         <></>
//       )}
//     </select>
//   </div>
//   <div className="col-md-2 col-12 mt-3 mt-md-0">
//     <select
//       name="cities"
//       id="cities"
//       className="form-select"
//       aria-label=".form-select-sm example"
//     // onChange={onFieldsChange}
//     >
//       <option value="">City</option>
//       {cities
//         ? cities.map((city, Index) => {
//             let optionToSelectByDefault = document.getElementById(
//               `cityFilter-${city.city_id}`
//             );
//             {/* if (dataToPost.city_id && optionToSelectByDefault) {
//               if (dataToPost.city_id === city.city_id) {
//                 optionToSelectByDefault.selected = true;
//               }
//             } */}
//             return (
//               <option
//                 id={`cityFilter-${city.city_id}`}
//                 key={Index}
//                 value={city.city_id}
//               >
//                 {city.city_name}
//               </option>
//             );
//           })
//         : ""}
//     </select>
//   </div>
//   <div className="col-md-2 col-12 mt-3 mt-md-0">
//     <select
//       name="asset"
//       id="asset"
//       className="form-select"
//       aria-label=".form-select-sm example"
//     // onChange={onFieldsChange}
//     >
//       <option value="">Category</option>
//       {assetCategory
//         ? assetCategory.map((category, Index) => {
//             let optionToSelectByDefault = document.getElementById(
//               `categoryFilter-${category.type_id}`
//             );
//             {/* if (dataToPost.type_id && optionToSelectByDefault) {
//               if (dataToPost.type_id === category.type_id) {
//                 optionToSelectByDefault.selected = true;
//               }
//             } */}
//             return (
//               <option
//                 id={`categoryFilter-${category.type_id}`}
//                 key={Index}
//                 value={category.type_id}
//               >
//                 {category.type_name}
//               </option>
//             );
//           })
//         : ""}
//     </select>
//   </div>
//   <div className="col-md-2 col-12 mt-3 mt-md-0">
//     <select
//       name="bank"
//       id="bank"
//       className="form-select"
//       aria-label=".form-select-sm example"
//     // onChange={onFieldsChange}
//     >
//       <option value="">Bank</option>
//       {banks
//         ? banks.map((bank, Index) => {
//             return (
//               <option key={Index} value={bank.bank_id}>
//                 {bank.bank_name}
//               </option>
//             );
//           })
//         : ""}
//     </select>
//   </div>
//   <div className="col-md-2 col-12 mt-3 mt-md-0">
//     <div className="dropdown">
//       <div
//         data-bs-toggle="dropdown"
//         aria-expanded="false"
//         className="form-select"
//       >
//         <div
//           value=""
//           style={{
//             overflow: "hidden",
//             fontWeight: "normal",
//             display: "block",
//             whiteSpaceCollapse: "collapse",
//             textWrap: "nowrap",
//             minHeight: "1.2em",
//             padding: "0px 2px 1px",
//           }}
//         >
//           {/* <span className="me-2 badge bg-dark">{filtersCount}</span> */}
//           More Filters
//         </div>
//       </div>
//       <ul
//         onClick={(e) => {
//           e.stopPropagation();
//         }}
//         className="dropdown-menu more-filters-dropdown-menu shadow"
//         aria-labelledby="dropdownMenuButton1"
//       >
//         <div className="container-fluid p-3">
//           {/* <form className="row" ref={moreFiltersForm}>
//             <div className="col-12">
//               <label
//                 htmlFor=""
//                 className="form-label common-btn-font"
//               >
//                 Price (<i className="bi bi-currency-rupee"></i>)
//               </label>
//             </div>
//             <div className="col-md-6 mb-3">
//               <select
//                 id="min_price"
//                 name="min_price"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option className="min-price-options" value="">
//                   Min
//                 </option>
//                 {propertyMinPrices.map((price, Index) => {
//                   return (
//                     <option
//                       className="min-price-options"
//                       value={price}
//                       key={Index}
//                     >
//                       {price}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//             <div className="col-md-6 mb-3">
//               <select
//                 id="max_price"
//                 name="max_price"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option className="max-price-options" value="">
//                   Max
//                 </option>
//                 {propertyMaxPrices.map((price, Index) => {
//                   return (
//                     <option
//                       className="max-price-options"
//                       value={price}
//                       key={Index}
//                     >
//                       {price}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//             <div className="col-12">
//               <hr />
//             </div>
//             <div className="col-md-6 mb-3">
//               <label
//                 htmlFor="title_clear_property"
//                 className="form-label common-btn-font"
//               >
//                 Title clear property
//               </label>
//               <select
//                 id="title_clear_property"
//                 name="title_clear_property"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option value=""></option>
//                 <option value="yes">Yes</option>
//                 <option value="no">No</option>
//               </select>
//             </div>
//             <div className="col-md-6 mb-3">
//               <label
//                 htmlFor="territory"
//                 className="form-label common-btn-font"
//               >
//                 Territory
//               </label>
//               <select
//                 id="territory"
//                 name="territory"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option value=""></option>
//                 <option value="gram panchayat limit">
//                   Gram Panchayat Limit
//                 </option>
//                 <option value="corporate">Corporate limit</option>
//               </select>
//             </div>
//             <div className="col-12">
//               <hr />
//             </div>
//             <div className="col-12">
//               <label
//                 htmlFor=""
//                 className="form-label common-btn-font"
//               >
//                 Carpet Area ( sqft )
//               </label>
//             </div>
//             <div className="col-md-6 mb-3">
//               <select
//                 id="min_area"
//                 name="min_area"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option className="min-carpet-area-options" value="">
//                   Min
//                 </option>
//                 {propertyMinArea.map((area, Index) => {
//                   return (
//                     <option
//                       className="min-carpet-area-options"
//                       value={area}
//                       key={Index}
//                     >
//                       {area}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>

//             <div className="col-md-6 mb-3">
//               <select
//                 id="max_area"
//                 name="max_area"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option className="max-carpet-area-options" value="">
//                   Max
//                 </option>
//                 {propertyMaxArea.map((area, Index) => {
//                   return (
//                     <option
//                       className="max-carpet-area-options"
//                       value={area}
//                       key={Index}
//                     >
//                       {area}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//             <div className="col-12">
//               <hr />
//             </div>
//             <div className="col-12">
//               <label
//                 htmlFor=""
//                 className="form-label common-btn-font"
//               >
//                 Age of Property
//               </label>
//             </div>
//             <div className="col-md-6 mb-3">
//               <select
//                 id="age"
//                 name="age"
//                 className="form-select form-select-sm"
//                 aria-label=".form-select-sm example"
//                 onChange={onMoreFiltersInputChange}
//               >
//                 <option value=""></option>
//                 <option value="1">Less than 1 year</option>
//                 <option value="3">Less than 3 years</option>
//                 <option value="5">Less than 5 years</option>
//                 <option value="10">Less than 10 years</option>
//               </select>
//             </div>
//           </form> */}
//         </div>
//       </ul>
//     </div>
//   </div>
//   <div className="col-md-1 col-12 my-3 my-md-0">
//     <button
//       onClick={() => {
//         // getPropertyData();
//       }}
//       // disabled={searchBtnDisabled}
//       className="btn w-100 btn-primary text-center"
//     >
//       <i className="bi bi-search"></i>
//     </button>
//   </div>
//   {/* <div
//     className={`col-12 text-center mt-md-3 ${
//       filtersCount > 0 ? "" : "d-none"
//     }`}
//   >
//     <button
//       onClick={resetFilters}
//       className="btn btn-secondary text-center"
//     >
//       Reset More Filters
//     </button>
//   </div> */}
// </div>