import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { SEARCH_BOOKS, SAVED_BOOKS, SAVE_BOOK, DELETE_BOOK } from "../queries";

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState("");
  const { loading: searchLoading, data: searchResult } = useQuery(SEARCH_BOOKS, {
    variables: { input: searchInput },
    skip: !searchInput,
  });
  const { loading: savedLoading, data: { savedBooks = [] } } = useQuery(SAVED_BOOKS);
  const [saveBook] = useMutation(SAVE_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);
  const savedBookIds = savedBooks.map(({bookId}) => bookId);
  const searchedBooks = searchResult?.searchBooks || [];

  const handleFormSubmit = (event) => {
    event.preventDefault();
    try {
      // If the searchInput is empty, don't execute the search
      if (!searchInput) {
        return false;
      }

      if (searchLoading || savedLoading) {
        return false;
      }

      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    // Call the saveBook mutation with the bookId variable
    try {
      await saveBook({
        variables: { bookId },
        refetchQueries: [{ query: SAVED_BOOKS }],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    // Call the deleteBook mutation with the bookId variable
    try {
      await deleteBook({
        variables: { bookId },
        refetchQueries: [{ query: SAVED_BOOKS }],
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length ? `Viewing ${searchedBooks.length} results:` : "Search for a book to begin"}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            const { bookId, title, authors, description, image } = book;
            return (
              <Col md="4" key={bookId}>
                <Card border="dark">
                  {image && (
                    <Card.Img
                      src={image}
                      alt={`The cover for ${title}`}
                      variant="top"
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <p className="small">Authors: {authors}</p>
                    <Card.Text>{description}</Card.Text>
                    {savedBooks && (
                      <Button
                        disabled={savedBookIds.includes(bookId)}
                        variant="primary"
                        onClick={() => handleSaveBook(bookId)}
                      >
                        {savedBookIds.includes(bookId) ? "Book already saved" : "Save this book"}
                      </Button>
                    )}
                    {savedBooks && savedBookIds.includes(bookId) && (
                      <Button
                        className="ml-2"
                        variant="danger"
                        onClick={() => handleDeleteBook(bookId)}
                      >
                        Delete this Book
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;