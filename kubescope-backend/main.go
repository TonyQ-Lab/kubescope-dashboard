package main

type Person struct {
	name string
	age  int
}

func (p *Person) greetings() {
	print("Hello world")
}

func main() {
	var p1 = Person{
		name: "Tony",
		age:  12,
	}

	print(p1.age)
}
