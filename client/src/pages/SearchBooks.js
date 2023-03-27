import React, { useState, useEffect } from "react";
import { Container, Col, Button, Card, Row } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import Auth from "../utils/auth";
import { searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import { SAVE_BOOK } from "../utils/mutations";

const SearchBooks = () => {
const [searchedBooks, setSearchedBooks] = useState([]);
const [searchInput, setSearchInput] = useState("");
const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

useEffect(() => {
  return () => saveBookIds(savedBookIds);
});

const [saveBook] = useMutation(SAVE_BOOK, {
  onError: (err) => console.error(err),
  onCompleted: (data) => {
    setSavedBookIds([...savedBookIds, data.saveBook.bookId]);
  }
});

const handleFormSubmit = async (event) => {
  event.preventDefault();
  if (!searchInput) {
    return false;
  }

  try {
    const response = await searchGoogleBooks(searchInput);

    if (!response.ok) {
     throw new Error("something went wrong!");
    }

    const { items } = await response.json();

    const bookData = items.map((book) => ({
      bookId: book.id,
      authors: book.volumeInfo.authors || ["No author to display"],
      title: book.volumeInfo.title,
      description: book.volumeInfo.description,
      image: book.volumeInfo.imageLinks?.thumbnail || "",
    }));

    setSearchedBooks(bookData);
    setSearchInput("");
  } catch (err) {
    console.error(err);
  }
};

const handleSaveBook = async (bookId) => {
  const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
  const token = Auth.loggedIn() ? Auth.getToken() : null;

  if (!token) {
    return false;
  }

  try {
    await saveBook({
      variables: { input: bookToSave },
    });
  } catch (err) {
    console.error(err);
  }
};

return (
  <form onSubmit={handleFormSubmit}>
    <div className="text-light bg-dark p-5">
      <Container>
        <h1>Search for Books!</h1>
        <div className="form-group">
          <input
            className="form-control form-control-lg"
            name="searchInput"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            placeholder="Search for a book"
          />
        </div>
        <Button type="submit" variant="success" size="lg">
          Submit Search
        </Button>
      </Container>
    </div>

    <Container>
      <h2 className="pt-5">
        {searchedBooks.length
          ? `Viewing ${searchedBooks.length} results:`
          : "Search for a book to begin"}
      </h2>
      <Row>
        {searchedBooks.map((book) => {
          return (
            <Col md="4">
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )
                        ? "This book has already been saved!"
                        : "Save this Book!"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  </form>
)};

export default SearchBooks;