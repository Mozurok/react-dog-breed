import ReactDOM from "react-dom";
import React, { Component } from "react";
import "./styles.css";

// Instructions: You will be using the Dog CEO breed api, documentation here: https://dog.ceo/dog-api/documentation/breed
// Get the following to work:
//
// 1.) Enter a dog breed in the input and display list of results after clicking "Fetch Dogs"
// 2.) Limit the results to 10
// 3.) Add the abtility to delete an image when you click on it
// 4.) Add the ability to search for 2 breeds; separate breeds with an "AND" e.g. "poodle AND corgi". Sort the results
// 5.) Search for the following breeds and display 1 image per breed: [ 'poodle', 'hound-afghan', 'labrador', 'bulldog', 'beagle']

const fetchBreeds = async (breed) => {
  return fetch(`https://dog.ceo/api/breed/${breed}/images`);
};

class DogImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      searchText: "",
      loading: false,
      searchStated: false,
      sortFilter: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleInputChange(e) {
    const searchText = e.currentTarget.value;
    this.setState({
      searchText
    });
  }

  handleDelete(imgTarget) {
    this.setState({
      images: this.state.images.filter((i, key) => key !== imgTarget)
    });
  }

  async makeBreedFetch(breed) {
    try {
      const value = await fetchBreeds(breed);
      const images = await value.json();

      console.log(images);

      let filterImages = images.message;
      if (images.status === "error") {
        filterImages = [];
      }
      if (filterImages.length > 10) {
        filterImages = images.message.slice(0, 10);
      }

      console.log(filterImages);
      return filterImages;
    } catch (error) {
      console.log(error);
    }
  }

  async handleSubmit(getOneImage = false) {
    const breed = this.state.searchText.toLowerCase();

    if (breed === "" && !getOneImage) {
      return false;
    }

    this.setState({
      loading: true,
      searchStated: true
    });

    let splitTextSearch = breed.split("and");
    splitTextSearch = splitTextSearch.map((s) => s.trim());
    splitTextSearch = [...new Set(splitTextSearch)];

    if (getOneImage) {
      splitTextSearch = [
        "poodle",
        "hound-afghan",
        "labrador",
        "bulldog",
        "beagle"
      ];
    }

    if (splitTextSearch.length >= 2) {
      const promises = splitTextSearch.map((s) => {
        return this.makeBreedFetch(s);
      });

      Promise.all(promises).then((results) => {
        let mergeArrays = [];
        const sortObj = [];

        results.forEach((r, key) => {
          if (getOneImage) {
            mergeArrays = [...mergeArrays, r[0]];
          } else {
            mergeArrays = [...mergeArrays, ...r];
            sortObj.push({ name: splitTextSearch[key], dogs: r });
          }
        });

        this.setState({
          images: mergeArrays,
          loading: false,
          sortFilter: sortObj
        });
      });
    } else {
      const res = await this.makeBreedFetch(splitTextSearch[0]);
      this.setState({
        images: res,
        loading: false
      });
    }
  }

  handleSort(target) {
    let dogsSort = [];
    if (target === "all_dogs") {
      this.state.sortFilter.forEach((s) => {
        dogsSort = [...dogsSort, ...s.dogs];
      });
    } else {
      dogsSort = this.state.sortFilter.filter((i) => i.name === target);
      dogsSort = dogsSort[0].dogs;
    }

    this.setState({
      images: dogsSort
    });
  }

  render() {
    return (
      <div className="wrapper">
        <input
          className="input-search"
          placeholder="Dog Breed e.g. poodle"
          value={this.state.searchText}
          onChange={(e) => {
            this.setState({
              searchStated: false
            });
            this.handleInputChange(e);
          }}
        />
        <div className="div-buttons">
          <button
            className="button-search"
            onClick={() => {
              this.handleSubmit();
            }}
          >
            Fetch Dogs
          </button>
          <button
            className="button-search-per-dog"
            onClick={() => {
              this.handleSubmit(true);
            }}
          >
            Fetch 1 Image per Dog
          </button>
        </div>
        {this.state.sortFilter.length > 0 && (
          <div className="sort">
            <button
              onClick={() => {
                this.handleSort("all_dogs");
              }}
              className="button-sort"
            >
              Show all dogs
            </button>
            {this.state.sortFilter.map((s) => (
              <button
                onClick={() => {
                  this.handleSort(s.name);
                }}
                className="button-sort"
                key={s.name}
              >
                Show only {s.name} dogs
              </button>
            ))}
          </div>
        )}
        {this.state.loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ul className="ul-list-imgs">
            {this.state.images
              .filter((i) => i)
              .map((i, key) => (
                <li className="list-image" key={key}>
                  <img
                    onClick={() => {
                      this.handleDelete(key);
                    }}
                    alt="image1"
                    className="dog-image"
                    src={i}
                  />
                </li>
              ))}
          </ul>
        )}
        {this.state.images.length === 0 &&
          !this.state.loading &&
          this.state.searchText !== "" &&
          this.state.searchStated && (
            <div className="feedback">
              Ops.. we found no results for "{this.state.searchText}" :(
            </div>
          )}
      </div>
    );
  }
}

ReactDOM.render(<DogImages />, document.getElementById("root"));
