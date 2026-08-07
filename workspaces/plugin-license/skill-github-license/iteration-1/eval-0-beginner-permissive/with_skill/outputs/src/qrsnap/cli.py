import click
import qrcode


@click.command()
@click.argument("url")
@click.option("--size", default=300, help="Image size in pixels.")
@click.option("-o", "--output", default="qr.png", help="Output file path.")
def main(url, size, output):
    img = qrcode.make(url)
    img = img.resize((size, size))
    img.save(output)
    click.echo(f"wrote {output}")
