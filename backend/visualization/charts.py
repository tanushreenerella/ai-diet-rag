import matplotlib.pyplot as plt

def create_chart(values):

    fig = plt.figure()

    plt.bar(range(len(values)), values)

    plt.xlabel("Retrieved Result")

    plt.ylabel("Text Length")

    plt.title("Vector Search Result Analysis")

    return fig